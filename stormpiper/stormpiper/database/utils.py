import logging

import geopandas
import pandas
import sqlalchemy as sa
from geoalchemy2.shape import to_shape

from stormpiper.core.config import settings

from ..core.utils import datetime_to_isoformat
from .changelog import sync_log
from .connection import get_session

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def orm_fields(orm) -> list[str]:
    return [str(f) for f in orm.__table__.columns.keys()]


def orm_to_dict(row) -> dict:
    """Convert an ORM return object to a dict."""
    row_dict = {col: getattr(row, col) for col in orm_fields(row)}
    return row_dict


def scalars_to_records(rows) -> list[dict]:
    """Convert ORM scalars to list of dicts [records]"""

    return [orm_to_dict(row) for row in rows]


def scalar_records_to_gdf(
    records: list[dict], crs: int | None = None, geometry: str = "geom"
) -> geopandas.GeoDataFrame:
    if crs is None:  # pragma: no cover
        crs = 4326
    data = (
        pandas.DataFrame(records)
        .assign(geometry=lambda df: df[geometry].apply(lambda x: to_shape(x)))
        .pipe(datetime_to_isoformat)
    )
    gdf = geopandas.GeoDataFrame(data, geometry="geometry", crs=crs)  # type: ignore

    if geometry != "geometry":  # pragma: no branch
        gdf.drop(columns=[geometry], inplace=True)
    return gdf


def scalars_to_gdf(
    scalars: list, crs: int | None = None, geometry: str = "geom"
) -> geopandas.GeoDataFrame:
    records = scalars_to_records(scalars)
    return scalar_records_to_gdf(records, crs=crs, geometry=geometry)


def scalars_to_gdf_to_geojson(scalars: list):
    gdf = scalars_to_gdf(scalars, crs=settings.TACOMA_EPSG, geometry="geom")
    gdf.to_crs(epsg=4326, inplace=True)
    content = gdf.to_json(show_bbox=True)

    return content


def sequence_exists(*, sequence_name: str, connectable, schema: str = "public") -> bool:
    q = sa.text(
        """
SELECT COUNT(*)
FROM information_schema.sequences
WHERE sequence_schema=:schema AND sequence_name=:sequence_name
""",
    )

    res = connectable.execute(
        q, {"schema": schema, "sequence_name": sequence_name}
    ).fetchone()

    return res.count > 0


def reset_sequence(*, table_name, connectable):
    sequence_name = f"{table_name}_id_seq"

    try:
        seq_exists = sequence_exists(
            sequence_name=sequence_name,
            connectable=connectable,
        )
        if seq_exists:
            logger.info(f"resetting sequence: {sequence_name}")
            q = sa.text(f"select setval(:sequence_name, max(id)) from {table_name}")
            connectable.execute(q, {"sequence_name": sequence_name})
    except Exception as e:  # pragma: no cover
        logger.exception(e)

    return


def _delete_and_replace_db(
    *, method_name: str, df: pandas.DataFrame, table_name: str, engine, **kwargs
):
    """
    Overwrites contents of `table_name` with contents of df.
    df schema must match destination table if the table already exists.
    """
    method = getattr(df, method_name, df.to_sql)

    index = kwargs.pop("index", False)
    chunksize = kwargs.pop("chunksize", 5000)

    table_exists = sa.inspect(engine).has_table(table_name)

    Session = get_session(engine=engine)
    with engine.begin() as conn:
        if table_exists:  # pragma: no branch
            q = sa.text(f'delete from "{table_name}";')
            conn.execute(q)
        logger.info(f"Updating table {table_name}")
        method(
            table_name,
            con=conn,
            if_exists="append",
            index=index,
            chunksize=chunksize,
            **kwargs,
        )

        # same transaction scope to update the change log
        with Session.begin() as session:  # type: ignore
            logger.info("recording table change...")
            sync_log(tablename=table_name, db=session)

    # separate transaction scope since this might fail. failure to reset is ok, not all
    # tables have sequences of id's as their pk (e.g., result_blob)
    with engine.begin() as conn:
        reset_sequence(table_name=table_name, connectable=conn)

    return None


def delete_and_replace_postgis_table(
    *, gdf: geopandas.GeoDataFrame, table_name: str, engine, **kwargs
) -> None:
    """
    Overwrites contents of `table_name` with contents of gdf.
    gdf schema must match destination table if the table already exists.
    """
    if gdf.geometry.name != "geom":  # pragma: no branch
        gdf = gdf.rename_geometry("geom")  # type: ignore
    return _delete_and_replace_db(
        method_name="to_postgis",
        df=gdf,
        table_name=table_name,
        engine=engine,
        **kwargs,
    )


def delete_and_replace_table(
    *, df: pandas.DataFrame, table_name: str, engine, **kwargs
) -> None:
    """
    Overwrites contents of `table_name` with contents of df.
    df schema must match destination table if the table already exists.
    """
    return _delete_and_replace_db(
        method_name="to_sql",
        df=df,
        table_name=table_name,
        engine=engine,
        **kwargs,
    )
