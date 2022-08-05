import geopandas
import numpy
import pandas

from stormpiper.database.connection import engine


def get_geojson():
    pass


def overlay_rodeo():

    with engine.begin() as conn:
        relid = pandas.read_sql("select distinct altid from tmnt_facility", con=engine)[
            "altid"
        ]

        # keep only the delineations that _definately_ have a match in the facility table.
        delin = geopandas.read_postgis("tmnt_facility_delineation", con=engine).query(  # type: ignore
            "relid in @relid"
        )
        subs = geopandas.read_postgis("subbasin", con=conn)
        out = (
            geopandas.overlay(delin, subs, how="union", keep_geom_type=True)
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
