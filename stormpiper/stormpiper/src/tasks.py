import logging

from stormpiper.connections import arcgis
from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.database.utils import (
    delete_and_replace_postgis_table,
    delete_and_replace_table,
)

from . import graph, loading, met, solve_structural_wq
from .tmnt import default_attrs, spatial

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def ping():
    return True


def update_tmnt_attributes(engine=engine, overwrite=None):
    if overwrite is None:
        overwrite = False

    df = default_attrs.update_tmnt_attributes(engine, overwrite=overwrite)

    return df


def delete_and_refresh_tmnt_facility_table(
    *, engine=engine, bmp_url=None, codes_url=None, cols=None
):

    logger.info("fetching tmnt facilities")
    gdf = arcgis.get_tmnt_facilities(bmp_url=bmp_url, codes_url=codes_url, cols=cols)

    logger.info("deleting and replacing tmnt_facility table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="tmnt_facility", engine=engine)
    logger.info("TASK COMPLETE: replaced tmnt_facility table.")

    return gdf


def delete_and_refresh_tmnt_facility_delineation_table(*, engine=engine, url=None):

    logger.info("fetching tmnt facility delineations")
    gdf = arcgis.get_tmnt_facility_delineations(url=url)

    logger.info("deleting and replacing tmnt_facility_delineation table")
    delete_and_replace_postgis_table(
        gdf=gdf, table_name="tmnt_facility_delineation", engine=engine
    )
    logger.info("TASK COMPLETE: replaced tmnt_facility_delineation table.")

    return gdf


def delete_and_refresh_subbasin_table(*, engine=engine, url=None, cols=None):

    logger.info("fetching subbasin info")
    gdf = arcgis.get_subbasins(url=url, cols=cols)

    logger.info("deleting and replacing subbasin table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="subbasin", engine=engine)
    logger.info("TASK COMPLETE: replaced subbasin table.")

    return gdf


def delete_and_refresh_lgu_boundary_table(*, engine=engine):
    logger.info("Creating lgu_boundary with the overlay rodeo")
    gdf = spatial.overlay_rodeo_from_database(engine)

    logger.info("deleting and replacing lgu_boundary table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="lgu_boundary", engine=engine)
    logger.info("TASK COMPLETE: replaced lgu_boundary table.")

    return gdf


def delete_and_refresh_lgu_load_table(*, engine=engine):
    logger.info("Recomputing LGU Loading with Earth Engine")
    df = loading.compute_loading_db(engine=engine)

    if df is None:
        logger.error("TASK FAILED: delete_and_refresh_lgu_load_table.")
        return

    logger.info("deleting and replacing lgu_load table")
    delete_and_replace_table(df=df, table_name="lgu_load", engine=engine, index=False)
    logger.info("TASK COMPLETE: replaced lgu_load table.")

    return df


def delete_and_refresh_met_table(*, engine=engine):
    logger.info("Reloading Met Table")
    df = met.create_met_dataframe()

    logger.info("deleting and replacing met table")
    delete_and_replace_table(df=df, table_name="met", engine=engine)
    logger.info("TASK COMPLETE: replaced met table.")

    return df


def delete_and_refresh_graph_edge_table(*, engine=engine):
    logger.info("Reloading Graph Edge Table")
    df = graph.build_edge_list_from_database(engine=engine)

    logger.info("deleting and replacing graph_edge table")
    delete_and_replace_table(df=df, table_name="graph_edge", engine=engine)
    logger.info("TASK COMPLETE: replaced graph_edge table.")

    return df


def delete_and_refresh_result_table(*, engine=engine):
    logger.info("Solving Watershed...")

    df = solve_structural_wq.solve_wq_epochs_from_db(engine=engine)

    logger.info("deleting and replacing results_blob table")
    delete_and_replace_table(
        df=df, table_name="result_blob", engine=engine, index=False
    )
    logger.info("TASK COMPLETE: replaced results_blob table.")

    return df
