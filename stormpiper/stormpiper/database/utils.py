import logging

import geopandas
from sqlalchemy import MetaData
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def merge_metadata(*Bases) -> MetaData:
    merged = MetaData()

    for Base in Bases:
        for table in Base.metadata.tables.values():
            table.to_metadata(merged)

    return merged


row2dict = lambda row: dict(
    (col, getattr(row, col)) for col in row.__table__.columns.keys()
)


def delete_and_replace_postgis_table(
    *, gdf: geopandas.GeoDataFrame, table_name: str, engine, **kwargs
):
    """
    Overwrites contents of `table_name` with contents of gdf.
    gdf schema must match destination table if the table already exists.
    """
    with engine.begin() as conn:
        if engine.dialect.has_table(conn, table_name):
            conn.execute(f"delete from {table_name}")
        return gdf.rename_geometry("geom").to_postgis(
            table_name, con=conn, if_exists="append", **kwargs
        )


@retry(
    stop=stop_after_attempt(60 * 5),  # 5 mins
    wait=wait_fixed(2),  # 2 seconds
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def reconnect_engine(engine):
    try:
        with engine.begin() as conn:
            # this should connect/login and ensure that the database is available.
            conn.execute("select 1").fetchall()

    except Exception as e:
        logger.error(e)
        raise e
