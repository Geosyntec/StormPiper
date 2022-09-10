import logging

import pandas

from stormpiper.connections import arcgis
from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.database.utils import (
    delete_and_replace_postgis_table,
    delete_and_replace_table,
)

from . import graph, loading, met, results, solve_structural_wq
from .tmnt import default_attrs, default_tmnt_source_controls, spatial

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
    gdf = (
        arcgis.get_tmnt_facilities(bmp_url=bmp_url, codes_url=codes_url, cols=cols)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    logger.info("deleting and replacing tmnt_facility table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="tmnt_facility", engine=engine)
    logger.info("TASK COMPLETE: replaced tmnt_facility table.")

    return gdf


def delete_and_refresh_tmnt_facility_delineation_table(*, engine=engine, url=None):

    logger.info("fetching tmnt facility delineations")
    gdf = (
        arcgis.get_tmnt_facility_delineations(url=url)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    logger.info("deleting and replacing tmnt_facility_delineation table")
    delete_and_replace_postgis_table(
        gdf=gdf,
        table_name="tmnt_facility_delineation",
        engine=engine,
    )
    logger.info("TASK COMPLETE: replaced tmnt_facility_delineation table.")

    return gdf


def delete_and_refresh_subbasin_table(*, engine=engine, url=None, cols=None):

    logger.info("fetching subbasin info")
    gdf = (
        arcgis.get_subbasins(url=url, cols=cols)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    logger.info("deleting and replacing subbasin table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="subbasin", engine=engine)
    logger.info("TASK COMPLETE: replaced subbasin table.")

    return gdf


def delete_and_refresh_lgu_boundary_table(*, engine=engine):
    logger.info("Creating lgu_boundary with the overlay rodeo")
    gdf = (
        spatial.overlay_rodeo_from_database(engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    logger.info("deleting and replacing lgu_boundary table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="lgu_boundary", engine=engine)
    logger.info("TASK COMPLETE: replaced lgu_boundary table.")

    return gdf


def delete_and_refresh_lgu_load_table(*, engine=engine):
    logger.info("Recomputing LGU Loading with Earth Engine")
    df = (
        loading.compute_loading_db(engine=engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    logger.info("deleting and replacing lgu_load table")
    delete_and_replace_table(df=df, table_name="lgu_load", engine=engine)
    logger.info("TASK COMPLETE: replaced lgu_load table.")

    return df


def delete_and_refresh_met_table(*, engine=engine):
    logger.info("Reloading Met Table")
    df = (
        met.create_met_dataframe()
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )

    logger.info("deleting and replacing met table")
    delete_and_replace_table(df=df, table_name="met", engine=engine)
    logger.info("TASK COMPLETE: replaced met table.")

    return df


def delete_and_refresh_graph_edge_table(*, engine=engine):
    logger.info("Reloading Graph Edge Table")
    df = (
        graph.build_edge_list_from_database(engine=engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
    )

    logger.info("deleting and replacing graph_edge table")
    delete_and_replace_table(df=df, table_name="graph_edge", engine=engine)
    logger.info("TASK COMPLETE: replaced graph_edge table.")

    return df


def delete_and_refresh_result_table(*, engine=engine):
    """Solve volume and wq for STRUCTURAL BMPs"""
    logger.info("Solving Watershed...")

    df = solve_structural_wq.solve_wq_epochs_from_db(engine=engine)

    logger.info("deleting and replacing results_blob table")
    delete_and_replace_table(df=df, table_name="result_blob", engine=engine)
    logger.info("TASK COMPLETE: replaced results_blob table.")

    return df


def _delete_and_refresh_source_controls_upstream_load_reduction(*, engine=engine):
    """Solve wq for UPSTREAM Src Ctrls"""

    df = (
        results.source_controls_upstream_load_reduction_db(engine=engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
    )

    logger.info(
        "deleting and replacing tmnt_source_control_upstream_load_reduced table"
    )
    delete_and_replace_table(
        df=df,
        table_name="tmnt_source_control_upstream_load_reduced",
        engine=engine,
    )
    logger.info(
        "TASK COMPLETE: replaced tmnt_source_control_upstream_load_reduced table."
    )

    return df


def _delete_and_refresh_lgu_load_to_structural_table(*, engine=engine):
    """Prepare loading table FROM Upstream Src Ctrl TO Structural BMPs"""

    logger.info("Updating load to structural bmps table...")

    df = (
        loading.load_to_structural_bmps_from_db(engine=engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
    )

    logger.info("deleting and replacing lgu_load_to_structural table")
    delete_and_replace_table(df=df, table_name="lgu_load_to_structural", engine=engine)
    logger.info("TASK COMPLETE: replaced lgu_load_to_structural table.")

    return df


def delete_and_refresh_upstream_src_ctrl_tables(*, engine=engine):
    """First compute upstream load reduction, THEN compute load to
    next dependant, i.e., structural BMPs
    """
    _delete_and_refresh_source_controls_upstream_load_reduction(engine=engine)
    _delete_and_refresh_lgu_load_to_structural_table(engine=engine)


def _delete_and_refresh_load_to_ds_src_ctrl_table(*, engine=engine):
    """Prepare loading table FROM Structural BMPs TO Downstream Src Ctrls"""

    logger.info("Updating load to downstream src ctrls table...")

    df = (
        loading.load_to_downstream_src_ctrls_from_db(engine=engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
    )

    logger.info("deleting and replacing load_to_ds_src_ctrl table")
    delete_and_replace_table(df=df, table_name="load_to_ds_src_ctrl", engine=engine)
    logger.info("TASK COMPLETE: replaced load_to_ds_src_ctrl table.")

    return df


def _delete_and_refresh_source_controls_downstream_load_reduction(*, engine=engine):
    """Solve wq for DOWNSTREAM Src Ctrls"""

    df = (
        results.source_controls_downstream_load_reduction_db(engine=engine)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
    )

    logger.info(
        "deleting and replacing tmnt_source_control_downstream_load_reduced table"
    )
    delete_and_replace_table(
        df=df,
        table_name="tmnt_source_control_downstream_load_reduced",
        engine=engine,
    )
    logger.info(
        "TASK COMPLETE: replaced tmnt_source_control_downstream_load_reduced table."
    )

    return df


def delete_and_refresh_downstream_src_ctrl_tables(*, engine=engine):
    """First compute load delivered to the downstream src controls, THEN compute
    the load reduced by them.
    """
    _delete_and_refresh_load_to_ds_src_ctrl_table(engine=engine)
    _delete_and_refresh_source_controls_downstream_load_reduction(engine=engine)


def delete_and_refresh_all_results_tables(*, engine=engine):
    delete_and_refresh_upstream_src_ctrl_tables(engine=engine)
    delete_and_refresh_graph_edge_table(engine=engine)
    delete_and_refresh_result_table(engine=engine)
    delete_and_refresh_downstream_src_ctrl_tables(engine=engine)


def build_default_tmnt_source_controls(*, engine=engine):
    subbasin = pandas.read_sql("subbasin", con=engine).subbasin.tolist()
    df = (
        default_tmnt_source_controls.dummy_tmnt_source_control(subbasin)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index + 1)
    )

    logger.info("deleting and replacing tmnt_source_control table")
    delete_and_replace_table(df=df, table_name="tmnt_source_control", engine=engine)
    logger.info("TASK COMPLETE: replaced tmnt_source_control table.")

    return df
