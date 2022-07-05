import logging

import geopandas

from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.earth_engine import loading, login

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def compute_loading(engine=engine):

    # TODO: put these where they belong.
    runoff_path = (
        "projects/ee-stormwaterheatmap/assets/production/Mean_Annual_Q_4_epochs"
    )
    conc_path = "projects/ee-stormwaterheatmap/assets/production/coc_concentrations"

    if login():

        with engine.begin() as conn:
            zones = geopandas.read_postgis("lgu_boundary", con=conn).to_crs(4326).to_json()  # type: ignore

        df_wide = loading.zonal_stats(
            runoff_path, conc_path, zones=zones, join_id="node_id"
        )

        df_tidy = df_wide.melt(id_vars=["node_id", "epoch"])

        return df_tidy
    else:
        logger.error("cannot log in to Earth Engine. Aborting loading calculation.")
        return
