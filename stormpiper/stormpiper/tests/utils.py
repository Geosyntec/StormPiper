import geopandas
import pandas
from passlib.context import CryptContext

from stormpiper.core.config import settings
from stormpiper.database import utils
from stormpiper.database.connection import get_session
from stormpiper.database.schemas.base import Base, User
from stormpiper.src import tasks
from stormpiper.tests.data import _base

hasher = CryptContext(schemes=["bcrypt"], deprecated="auto").hash


def clear_db(engine):
    tables = Base.metadata.tables.keys()
    with engine.begin() as conn:
        for table in tables:
            conn.execute(f'delete from "{table}";')


def get_token(app, username, password):
    response = app.post(
        "/auth/jwt-bearer/login",
        data={
            "username": username,
            "password": password,
        },
    )

    return response


def admin_token(client):
    response = get_token(client, "admin@geosyntec.com", settings.ADMIN_ACCOUNT_PASSWORD)

    return response.json()


def user_token(client):
    response = get_token(client, "existing_user@example.com", "existing_user_password")

    return response.json()


def seed_users(engine):

    Session = get_session(engine)

    with Session.begin() as session:  # type: ignore

        admin = User(  # type: ignore
            email="admin@geosyntec.com",
            hashed_password=hasher(settings.ADMIN_ACCOUNT_PASSWORD),
            is_active=True,
            is_superuser=True,
            is_verified=True,
            role="admin",
        )

        existing_user = User(  # type: ignore
            email="existing_user@example.com",
            hashed_password=hasher("existing_user_password"),
            is_active=True,
            role="user",
        )

        batch = [admin, existing_user]

        session.add_all(batch)


def seed_tacoma_gis_tables(engine):

    jsons = _base.datadir.glob("*.geojson")

    for f in jsons:
        gdf = geopandas.read_file(f).to_crs(settings.TACOMA_EPSG)
        table_name = f.stem

        utils.delete_and_replace_postgis_table(
            gdf=gdf,
            table_name=table_name,
            engine=engine,
            index=False,
        )


def seed_tacoma_derived_tables(engine):

    jsons = _base.datadir.glob("*.json")

    for f in jsons:
        df = pandas.read_json(f, orient="table")
        table_name = f.stem

        utils.delete_and_replace_table(
            df=df,  # type: ignore
            table_name=table_name,
            engine=engine,
            index=False,
        )

    tasks.delete_and_refresh_met_table(engine=engine)
    tasks.delete_and_refresh_graph_edge_table(engine=engine)
    tasks.delete_and_refresh_result_table(engine=engine)


def seed_db(engine):

    clear_db(engine)
    seed_users(engine)
    seed_tacoma_gis_tables(engine)
    tasks.update_tmnt_attributes(engine=engine)
    seed_tacoma_derived_tables(engine)
