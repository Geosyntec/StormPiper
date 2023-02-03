import json
from functools import lru_cache
from typing import List, Optional, Union

import ee
import pandas
from ee import FeatureCollection, Image


def _build_poc_loading_Image(
    runoff_depth_ImageBand: Image, concentration_ImageMultiBand: Image
) -> Image:
    ro_units = runoff_depth_ImageBand.toDictionary().get("units").getInfo()
    c_dict = concentration_ImageMultiBand.toDictionary()
    c_units = c_dict.get("units").getInfo()
    c_band = concentration_ImageMultiBand.bandNames().getInfo()

    c_pocs = [poc.split("_")[0] for poc in c_band]

    # make a multiband image with unit pollutant loading (mm/year * mcg/l)
    unit_loads = runoff_depth_ImageBand.multiply(concentration_ImageMultiBand)

    # Use ee.PixelArea() to get the area for each pixel. This image will be in m2. Multiply it by the unit load image
    load = unit_loads.multiply(Image.pixelArea())  # (mm/year * mcg/l * m^2)

    # Use the layer names to rename the bands to make it pretty
    layer_names = [
        f"{poc}_{c_units}*{ro_units}*m2".replace("/", "_per_").replace("*", "_x_")
        for poc in c_pocs
    ]
    load = load.rename(layer_names)

    return load


@lru_cache
def get_poc_loading_Image(
    runoff_path: str,
    concentration_path: str,
    runoff_band: Optional[Union[int, str]] = None,
) -> Image:
    if runoff_band is None:
        runoff_band = 0

    runoff = Image(runoff_path)
    runoff_depth_ImageBand = runoff.select(runoff_band)

    concentration_ImageMultiBand = Image(concentration_path)

    return _build_poc_loading_Image(
        runoff_depth_ImageBand, concentration_ImageMultiBand
    )


@lru_cache
def get_runoff_bands(runoff_path: str) -> List[str]:
    return Image(runoff_path).bandNames().getInfo()


def get_loading_zonal_stats(
    loading: Image, zones: FeatureCollection, scale=1
) -> FeatureCollection:
    # sum of values for each feature. For mean values, use ee.Reducer.mean()
    stats = loading.reduceRegions(
        collection=zones, reducer=ee.Reducer.sum(), scale=scale  # type: ignore
    )
    return stats


def get_loading_zonal_stats_df(info: dict) -> pandas.DataFrame:
    df = pandas.DataFrame([f["properties"] for f in info["features"]])

    return df


@lru_cache
def zonal_stats(
    *, runoff_path: str, concentration_path: str, zones: str, join_id="id"
) -> pandas.DataFrame:
    """
    zones can be a string path to eeobject or json.dumps
    """

    zones_fc = FeatureCollection(json.loads(zones))

    runoff = Image(runoff_path)
    ro_bands = get_runoff_bands(runoff_path)
    ro_units = runoff.toDictionary().get("units").getInfo()
    ro_dct = get_loading_zonal_stats(
        runoff.multiply(Image.pixelArea()), zones=zones_fc
    ).getInfo()
    df = (
        get_loading_zonal_stats_df(ro_dct)
        .melt(
            join_id,
            ro_bands,
            var_name="epoch",
            value_name=f"runoff_{ro_units}_x_m2".replace("/", "_per_"),
        )
        .assign(epoch=lambda df: df["epoch"].str.split("_").str[-1])
    )

    poc_dfs = []
    for epoch in ro_bands:
        loadingImage = get_poc_loading_Image(runoff_path, concentration_path, epoch)
        c_band = loadingImage.bandNames().getInfo()
        poc_dct = get_loading_zonal_stats(loadingImage, zones=zones_fc).getInfo()

        poc_df = (
            get_loading_zonal_stats_df(poc_dct)
            .reindex(columns=[join_id] + c_band)
            .assign(epoch=epoch.split("_")[-1])
        )

        poc_dfs.append(poc_df)

    poc_df = pandas.concat(poc_dfs)
    df_wide = df.merge(
        poc_df,
        on=[join_id, "epoch"],
        how="left",
    ).rename(
        columns=lambda c: c.replace("mm_per_year_x_m2", "L").replace(
            "mcg_per_L_x_L", "mcg"
        )
    )

    return df_wide


@lru_cache
def get_loading_layers(
    runoff_path: str,
    concentration_path: str,
):
    layer_dict = {}

    ro_bands = get_runoff_bands(runoff_path)

    visParamsTemplate = {
        "min": 0,
        "max": 1e5,
        "palette": [
            "#4575b4",
            "#91bfdb",
            "#e0f3f8",
            "#ffffbf",
            "#fee090",
            "#fc8d59",
            "#d73027",
        ],
        "opacity": 0.8,
        "name": "key",
        "bands": "key",
    }

    for epoch in ro_bands:
        loadingImage = get_poc_loading_Image(runoff_path, concentration_path, epoch)
        load_bands = loadingImage.bandNames().getInfo()
        for band in load_bands:
            layer_spec = {
                "sourceName": "City of Tacoma",
                "safe_name": band,
                "layer": {"url": "", "image": ""},
            }
            visParamsTemplate["bands"] = band
            map_id_dict = loadingImage.getMapId(visParamsTemplate)
            url = map_id_dict["tile_fetcher"].url_format
            layer_spec["layer"]["url"] = url
            layer_spec["layer"]["image"] = loadingImage

            layer_dict[band] = layer_spec

    return layer_dict
