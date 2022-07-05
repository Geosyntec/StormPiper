import geopandas
import numpy

from stormpiper.database.connection import engine


def get_geojson():
    pass


def overlay_rodeo():

    with engine.begin() as conn:
        delin = geopandas.read_postgis("tmnt_facility_delineation", con=conn)
        subs = geopandas.read_postgis("subbasin", con=conn)
        out = (
            geopandas.overlay(delin, subs, how="union", keep_geom_type=True)
            .assign(subbasin=lambda df: df["subbasin"].fillna("None").astype(str))
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
