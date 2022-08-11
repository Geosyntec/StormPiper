import pytest
from fastapi.testclient import TestClient

from stormpiper.core.config import settings
from stormpiper.database.connection import engine
from stormpiper.earth_engine import get_layers, get_tile_registry
from stormpiper.factory import create_app

from . import utils


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "integration: mark test as requiring a data connection"
    )


@pytest.fixture(scope="session")
def db():
    utils.seed_db(engine)
    yield


@pytest.fixture(scope="module")
def client(db):
    app = create_app()
    with TestClient(app) as client:
        yield client


def override_get_layers():
    return {
        "param": {
            "safe_name": "param",
            "layer": {"url": "string", "image": "image_obj"},
        }
    }


@pytest.fixture(scope="module")
def client_local(db):
    app = create_app()

    class Reg:
        def get(self, *args):
            return "./ping"

    override_get_tile_registry = lambda: Reg()
    app.dependency_overrides[get_tile_registry] = override_get_tile_registry
    app.dependency_overrides[get_layers] = override_get_layers

    with TestClient(app) as client:
        yield client
