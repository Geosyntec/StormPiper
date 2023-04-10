import json
import time
import uuid
from functools import wraps

import geopandas
import pandas
import sqlalchemy as sa
from passlib.context import CryptContext

from stormpiper.core.config import settings
from stormpiper.database import utils
from stormpiper.database.connection import get_session
from stormpiper.database.schemas.base import Base, User
from stormpiper.database.schemas.globals import GlobalSetting
from stormpiper.database.schemas.scenario import Scenario
from stormpiper.database.schemas.views import initialize_views
from stormpiper.earth_engine.login import base_login
from stormpiper.src import tasks
from stormpiper.startup import create_default_cost_globals
from stormpiper.tests.data import _base

hasher = CryptContext(schemes=["bcrypt"], deprecated="auto").hash


def with_ee_login(func):
    try:
        base_login()
    except:  # pragma: no cover
        print("Not logged in to EE!")

    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper


def clear_db(engine):
    # only delete ORM mapped tables, leave alembic and postgis tables alone.
    tables = Base.metadata.tables.keys()
    with engine.begin() as conn:
        for table in tables:
            if table.endswith("_v"):
                continue
            else:
                conn.execute(sa.text(f'delete from "{table}";'))


def get_token(app, username, password):
    response = app.post(
        "/auth/jwt-bearer/login",
        data={
            "username": username,
            "password": password,
        },
    )

    return response


def get_my_data(app):
    response = app.get("/api/rest/users/me")

    return response.json()


def admin_token(client):
    response = get_token(client, "admin@geosyntec.com", settings.ADMIN_ACCOUNT_PASSWORD)

    return response.json()


def user_token(client):
    response = get_token(client, "existing_user@example.com", "existing_user_password")

    return response.json()


def user_admin_token(client):
    response = get_token(
        client, "existing_user_admin@example.com", "existing_user_admin_password"
    )

    return response.json()


def reader_token(client):
    response = get_token(
        client, "existing_reader@example.com", "existing_reader_password"
    )

    return response.json()


def public_token(client):
    response = get_token(client, "joe_shmo@example.com", "existing_public_password")

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
            is_verified=True,
            role="editor",
        )

        existing_user_admin = User(  # type: ignore
            email="existing_user_admin@example.com",
            hashed_password=hasher("existing_user_admin_password"),
            is_active=True,
            is_superuser=True,
            is_verified=True,
            role="user_admin",
        )

        existing_reader = User(  # type: ignore
            email="existing_reader@example.com",
            hashed_password=hasher("existing_reader_password"),
            is_active=True,
            is_verified=True,
            role="reader",
        )

        public_user = User(  # type: ignore
            email="joe_shmo@example.com",
            hashed_password=hasher("existing_public_password"),
            is_active=True,
            role="public",
        )

        batch = [
            admin,
            existing_user,
            existing_user_admin,
            existing_reader,
            public_user,
        ]

        session.add_all(batch)


def load_json(filepath, engine):
    df = (
        pandas.read_json(filepath, orient="table")
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )
    table_name = filepath.stem

    utils.delete_and_replace_table(
        df=df,
        table_name=table_name,
        engine=engine,
        index=False,
    )


def load_geojson(filepath, engine):
    gdf = (
        geopandas.read_file(filepath)
        .to_crs(settings.TACOMA_EPSG)
        .reset_index(drop=True)
        .assign(id=lambda df: df.index.values + 1)
    )
    table_name = filepath.stem

    utils.delete_and_replace_postgis_table(
        gdf=gdf,
        table_name=table_name,
        engine=engine,
        index=False,
    )


def seed_tacoma_table_dependencies(engine):
    jsons = list(_base.datadir.glob("*json"))
    ordered = [
        "tmnt_facility",
        "tmnt_facility_delineation",
        "subbasin",
        "tmnt_source_control",
        "lgu_boundary",
        "lgu_load",
    ]

    ordered_jsons = [f for substr in ordered for f in jsons if substr == f.stem]

    for f in ordered_jsons:
        if "geojson" in str(f):
            load_geojson(f, engine)
        else:
            load_json(f, engine)


def seed_tacoma_derived_tables(engine):
    tasks.delete_and_refresh_met_table(engine=engine)
    tasks.update_tmnt_attributes(engine=engine)
    tasks.delete_and_refresh_all_results_tables(engine=engine)


def tacoma_scenarios() -> list[dict]:
    with open(_base.datadir / "scenario.json") as fp:
        scenarios = json.load(fp)
        return scenarios


def seed_tacoma_scenarios(engine):
    scenarios = tacoma_scenarios()

    Session = get_session(engine=engine)
    with Session.begin() as session:  # type: ignore
        for i, scenario in enumerate(scenarios):
            scenario["id"] = uuid.UUID(int=i, version=4)
            session.add(Scenario(**scenario))


def seed_db(engine):
    clear_db(engine)
    initialize_views(engine)
    seed_users(engine)
    create_default_cost_globals(engine)
    seed_tacoma_table_dependencies(engine)
    seed_tacoma_derived_tables(engine)
    seed_tacoma_scenarios(engine)

    Session = get_session(engine)

    with Session.begin() as session:  # type: ignore
        session.add(GlobalSetting(**{"variable": "test", "value": "test"}))


def poll_testclient_url(testclient, url, timeout=5, verbose=False):  # pragma: no cover
    ts = time.perf_counter()
    timer = lambda: time.perf_counter() - ts
    tries = 0

    while timer() < timeout:
        tries += 1
        response = testclient.get(url)
        status = response.json().get("status", "")
        if status.lower() == "success":
            if verbose:
                print(f"\nget request polling tried: {tries} times.")
            return response

        time.sleep(0.1)

    return
