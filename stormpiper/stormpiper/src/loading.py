import logging
from typing import Optional

import geopandas
import pandas

from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.earth_engine import loading, login

from .organics import VIRTUAL_POCS, add_virtual_pocs_to_tidy_load_summary
from .utils import get_loading_df_from_db, unpack_results_blob

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


POC_REMAPPER = {
    "DEHP": "DEHP",
    "Phenanthrene": "PHE",
    "Pyrene": "PYR",
    "TotalCopper": "TCu",
    "TotalNitrogen": "TN",
    "TotalPhosphorus": "TP",
    "TotalSuspendedSolids": "TSS",
    "TotalZinc": "TZn",
}


def compute_loading_zonal_stats(
    *,
    lgu_boundary: geopandas.GeoDataFrame,
    runoff_path: Optional[str] = None,
    coc_path: Optional[str] = None,
) -> pandas.DataFrame:

    runoff_path = runoff_path or settings.EE_RUNOFF_PATH
    coc_path = coc_path or settings.EE_COC_PATH

    if login():
        logger.info("Running zonal stats on earth engine...")
        zones = lgu_boundary.to_crs(4326).to_json()  # type: ignore

        df_wide = loading.zonal_stats(
            runoff_path=runoff_path,
            concentration_path=coc_path,
            zones=zones,
            join_id="node_id",
        )
        logger.info("Completed zonal stats on earth engine.")
    else:
        logger.error("cannot log in to Earth Engine. Aborting loading calculation.")
        return pandas.DataFrame([])

    return df_wide


def wide_load_to_tidy_load(wide_load: pandas.DataFrame, poc_remapper=POC_REMAPPER):

    df_tidy = (
        wide_load.melt(id_vars=["node_id", "epoch"])
        .assign(
            _variable=lambda df: df["variable"]
            .str.split("_")
            .str[:-1]  # pop off unit and rejoin
            .str.join("_")
        )
        .assign(
            units=lambda df: df["variable"].str.split("_").str[-1]
        )  # pop off unit into new column
        .assign(
            variable=lambda df: df["_variable"].replace(poc_remapper)
        )  # normalize poc names
        .drop(columns=["_variable"])
        .query("variable not in @VIRTUAL_POCS")
        .pipe(add_virtual_pocs_to_tidy_load_summary)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
        .set_index("id")
    )

    return df_tidy


def compute_loading(*, lgu_boundary, runoff_path=None, coc_path=None):
    try:
        wide_load = compute_loading_zonal_stats(
            lgu_boundary=lgu_boundary, runoff_path=runoff_path, coc_path=coc_path
        )
        if len(wide_load) > 0:
            tidy_load = wide_load_to_tidy_load(wide_load)
            return tidy_load
        return
    except Exception:
        logger.error("Could not create loading zonal stats from ee.")
        raise


def compute_loading_db(engine=engine, runoff_path=None, coc_path=None):

    with engine.begin() as conn:
        zones = geopandas.read_postgis("lgu_boundary", con=conn)

    df = compute_loading(lgu_boundary=zones, runoff_path=runoff_path, coc_path=coc_path)
    return df


### prep loading data for input into nereid


def _prep_00_loading_tidy_to_wide(df_tidy):
    """
    df tidy has node_id, and epoch fields
    """

    _df = df_tidy.pivot(
        index=["node_id", "epoch"], columns=["variable", "units"], values=["value"]
    )
    _df.columns = _df.columns.to_flat_index()
    _df = _df.rename(columns=lambda c: "_".join(c[1:])).reset_index()

    return _df


def _prep_01_loading_joins(prepped_wide, lgu_boundary, met):
    assert lgu_boundary.crs == settings.TACOMA_EPSG

    _df = prepped_wide.merge(
        lgu_boundary.assign(area_acres=lambda df: df.geometry.area / 43560)[
            ["node_id", "area_acres"]
        ],
        on="node_id",
        how="left",
    )

    _df = _df.merge(met, on="epoch", how="left")

    return _df


def _prep_02_loading_units(prepped_wide):

    _df = (
        prepped_wide.assign(
            **{
                c.replace("_mcg", "_lbs"): lambda df, c=c: df[c]
                / 453592370  # mcg -> lbs
                for c in prepped_wide.columns
                if "_mcg" in c
            }
        )
        .assign(runoff_volume_cuft=lambda df: df["runoff_L"] * 0.0353147)  # L -> cuft
        .assign(__area_sqft=lambda df: df["area_acres"] * 43560)  # sqft -> acres
        .assign(
            __runoff_depth_feet=lambda df: df["runoff_volume_cuft"]
            / (df["__area_sqft"])
        )
        .assign(
            runoff_depth_inches=lambda df: df["__runoff_depth_feet"] * 12
        )  # feet -> inches
        .assign(
            ro_coeff=lambda df: df["runoff_depth_inches"]
            / df["mean_annual_precip_depth_inches"]
        )
        .assign(eff_area_acres=lambda df: df["area_acres"] * df["ro_coeff"])
        .rename(columns=lambda c: c.replace("_lbs", "_load_lbs"))
    )
    _cols = [
        c for c in _df.columns if all(["__" != c[:2], "_mcg" not in c, "_L" not in c])
    ]
    prepped_loading = _df.reindex(columns=_cols)

    return prepped_loading


def land_surface_load_nereid(df_tidy, zones, met):
    df = (
        df_tidy.pipe(_prep_00_loading_tidy_to_wide)
        .pipe(_prep_01_loading_joins, zones, met)
        .pipe(_prep_02_loading_units)
    )
    return df


def land_surface_load_to_structural_from_db(epoch=None, connectable=engine):

    df_tidy = get_loading_df_from_db(
        tablename="lgu_load_to_structural", epoch=epoch, engine=connectable
    )
    zones = geopandas.read_postgis("lgu_boundary", con=connectable)
    met = pandas.read_sql("met", con=connectable)

    df = df_tidy.pipe(land_surface_load_nereid, zones, met)

    return df


def load_to_structural_bmps(*, lgu_load, upstream_load_reduced):
    lgu_load_to_structural = (
        lgu_load.merge(
            upstream_load_reduced.groupby(["node_id", "epoch", "variable"])[
                "load_reduced"
            ]
            .sum()
            .reset_index(),
            on=["node_id", "epoch", "variable"],
            how="left",
        )
        .fillna({"load_reduced": 0})
        .assign(value=lambda df: df["value"] - df["load_reduced"])
        .drop(columns="load_reduced")
        .assign(id=lambda df: df.index.values)
        .set_index("id")
    )

    return lgu_load_to_structural


def load_to_structural_bmps_from_db(*, engine=engine):
    lgu_load = pandas.read_sql("lgu_load", con=engine)
    upstream_load_reduced = pandas.read_sql(
        "tmnt_source_control_upstream_load_reduced", con=engine
    )

    df = load_to_structural_bmps(
        lgu_load=lgu_load, upstream_load_reduced=upstream_load_reduced
    )

    return df


def load_to_downstream_src_ctrls(result_blob):

    results = unpack_results_blob(result_blob)
    poc_prefixes = [
        c.split("_")[0]
        for c in results.columns
        if c.endswith("_total_discharged") and not "runoff" in c.lower()
    ]

    discharge_cols = [
        c for c in results.columns if "_load_lbs_total_discharged" in c.lower()
    ]

    cols = ["node_id", "epoch"] + discharge_cols

    # subbasin nodes start with "SB_"
    load_to_ds_src_ctrl = results.loc[results.node_id.str.startswith("SB_")][cols]

    for poc in poc_prefixes:
        load_to_ds_src_ctrl[poc + "_load_lbs_total_discharged"] = load_to_ds_src_ctrl[
            poc + "_load_lbs_total_discharged"
        ].fillna(results[poc + "_load_lbs"])

    load_to_ds_src_ctrl = (
        load_to_ds_src_ctrl.melt(id_vars=["node_id", "epoch"])
        .assign(units="lbs")
        .assign(variable=lambda df: df["variable"].str.split("_").str[0])
        .pipe(add_virtual_pocs_to_tidy_load_summary)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    return load_to_ds_src_ctrl


def load_to_downstream_src_ctrls_from_db(*, engine=engine):
    result_blob = pandas.read_sql("result_blob", con=engine)

    df = load_to_downstream_src_ctrls(result_blob)

    return df
