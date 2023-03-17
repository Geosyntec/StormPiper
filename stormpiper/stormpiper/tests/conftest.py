import pytest
from fastapi.testclient import TestClient

from stormpiper.database.connection import engine
from stormpiper.earth_engine import get_layers, get_tile_registry
from stormpiper.email_helper import email
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
        user_token = utils.user_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture(scope="module")
def admin_client(db):
    app = create_app()
    with TestClient(app) as client:
        user_token = utils.admin_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture(scope="module")
def user_admin_client(db):
    app = create_app()
    with TestClient(app) as client:
        user_token = utils.user_admin_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture(scope="module")
def readonly_client(db):
    app = create_app()
    with TestClient(app) as client:
        token = utils.reader_token(client)
        client.headers = {"Authorization": f"Bearer {token['access_token']}"}
        yield client


@pytest.fixture(scope="module")
def public_client(db):
    app = create_app()
    with TestClient(app) as client:
        token = utils.public_token(client)
        client.headers = {"Authorization": f"Bearer {token['access_token']}"}
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


@pytest.fixture(scope="module")
def client_lookup(
    db,
    client,
    admin_client,
    user_admin_client,
    readonly_client,
    client_local,
    public_client,
):
    return {
        "client": client,
        "admin_client": admin_client,
        "user_admin_client": user_admin_client,
        "editor_client": client,
        "readonly_client": readonly_client,
        "public_client": public_client,
        "client_local": client_local,
    }


@pytest.fixture(autouse=True)
def mock_send_email_to_user(monkeypatch):
    async def _mock_send_email(*args, **kwargs):
        print("fake email sent.")
        return

    monkeypatch.setattr(email, "send_email_to_user", _mock_send_email)
