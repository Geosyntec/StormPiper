import logging

from stormpiper.connections import arcgis
from stormpiper.database.utils import delete_and_replace_postgis_table
from stormpiper.database.connection import engine
from stormpiper.core.config import settings

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def ping():
    return True


def delete_and_refresh_tmnt_facility_table(*, bmp_url=None, codes_url=None, cols=None):

    logger.info("fetching tmnt facilities")
    gdf = arcgis.get_tmnt_facilities(bmp_url=bmp_url, codes_url=codes_url, cols=cols)

    logger.info("deleting and replacing tmnt_facility table")
    delete_and_replace_postgis_table(gdf=gdf, table_name="tmnt_facility", engine=engine)
    logger.info("TASK COMPLETE: replaced tmnt_facility table.")

    return gdf


def delete_and_refresh_tmnt_facility_delineation_table(*, url=None):

    logger.info("fetching tmnt facility delineations")
    gdf = arcgis.get_tmnt_facility_delineations(url=url)

    logger.info("deleting and replacing tmnt_facility_delineation table")
    delete_and_replace_postgis_table(
        gdf=gdf, table_name="tmnt_facility_delineation", engine=engine
    )
    logger.info("TASK COMPLETE: replaced tmnt_facility_delineation table.")

    return gdf
