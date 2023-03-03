import geopandas
import numpy
import pandas

from stormpiper.core.config import settings


def overlay_rodeo(
    *,
    delineations: geopandas.GeoDataFrame,
    subbasins: geopandas.GeoDataFrame,
    how: str | None = "union",
) -> geopandas.GeoDataFrame:
    if any(i is None for i in [delineations, subbasins]):
        return geopandas.GeoDataFrame([])

    if subbasins.geometry.name != "geometry":
        subbasins = subbasins.rename_geometry("geometry")  # type: ignore
    subbasins = subbasins.reindex(  # type: ignore
        columns=["subbasin", "basinname", "geometry"]
    )
    out: geopandas.GeoDataFrame = (
        geopandas.overlay(delineations, subbasins, how=how, keep_geom_type=True)  # type: ignore
        .assign(subbasin=lambda df: df["subbasin"].fillna("None").astype(str))
        .assign(basinname=lambda df: df["basinname"].fillna("None").astype(str))
        .assign(
            node_id=lambda df: numpy.where(
                df["node_id"].isna(),
                "SB_" + df["subbasin"],
                df["node_id"] + "_SB_" + df["subbasin"],
            )
        )
        .loc[lambda df: df.geometry.area > 1.0]
        .drop(columns=["id"], errors="ignore")
    )

    return out


def overlay_rodeo_from_database(engine) -> geopandas.GeoDataFrame:
    with engine.begin() as conn:
        relid = pandas.read_sql("select distinct altid from tmnt_facility", con=conn)[
            "altid"
        ]

        # keep only the delineations that _definately_ have a match in the facility table.
        delin = geopandas.read_postgis("tmnt_facility_delineation", con=conn).query(  # type: ignore
            "relid in @relid"
        )
        subs = geopandas.read_postgis("subbasin", con=conn)

    return overlay_rodeo(delineations=delin, subbasins=subs)  # type: ignore


def scenario_delin_json_to_gdf(geojson: str) -> geopandas.GeoDataFrame:
    delin: geopandas.GeoDataFrame = scenario_json_to_gdf(geojson).assign(
        area=lambda df: df.geometry.area
    )  # type: ignore

    return delin


def scenario_json_to_gdf(geojson: str) -> geopandas.GeoDataFrame:
    delin = geopandas.read_file(geojson).to_crs(settings.TACOMA_EPSG)

    return delin


def overlay_rodeo_for_scenario_from_database(
    *, scenario_delin: geopandas.GeoDataFrame, engine
) -> geopandas.GeoDataFrame:
    with engine.begin() as conn:
        subs = geopandas.read_postgis("subbasin", con=conn)

    rodeo: geopandas.GeoDataFrame = overlay_rodeo(
        delineations=scenario_delin,
        subbasins=subs,  # type: ignore
        how="intersection",
    )

    return rodeo


def assign_subbasin_to_points(
    points: geopandas.GeoDataFrame, engine
) -> geopandas.GeoDataFrame:
    with engine.begin() as conn:
        subs = geopandas.read_postgis("subbasin", con=conn)

        return points.sjoin(subs, how="left")
