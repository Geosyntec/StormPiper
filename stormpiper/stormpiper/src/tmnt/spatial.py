import geopandas
import numpy
import pandas


def overlay_rodeo(
    *, delineations: geopandas.GeoDataFrame, subbasins: geopandas.GeoDataFrame
) -> geopandas.GeoDataFrame:
    if any(i is None for i in [delineations, subbasins]):
        return geopandas.GeoDataFrame([])
    out = (
        geopandas.overlay(delineations, subbasins, how="union", keep_geom_type=True)
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
        .reindex(
            columns=[
                "node_id",
                "altid",
                "relid",
                "subbasin",
                "basinname",
                "geometry",
            ]
        )
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
