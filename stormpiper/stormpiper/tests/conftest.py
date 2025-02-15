import pytest
from fastapi.testclient import TestClient

from stormpiper.database.connection import engine, get_async_session
from stormpiper.earth_engine import get_tile_registry
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


@pytest.fixture
def app(db):
    app = create_app()
    app.dependency_overrides[get_async_session] = utils.get_async_session
    return app


@pytest.fixture
def readonly_token(app):
    token = ""
    with TestClient(app) as client:
        user_token = utils.reader_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        readonly_user_data = utils.get_my_data(client)
        token = readonly_user_data.get("readonly_token", None)
    return token


@pytest.fixture
def public_token(app):
    token = ""
    with TestClient(app) as client:
        user_token = utils.public_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        readonly_user_data = utils.get_my_data(client)
        token = readonly_user_data.get("readonly_token", None)
    return token


@pytest.fixture
def client(app):
    with TestClient(app) as client:
        user_token = utils.user_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture
def admin_client(app):
    with TestClient(app) as client:
        user_token = utils.admin_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture
def user_admin_client(app):
    with TestClient(app) as client:
        user_token = utils.user_admin_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture
def readonly_client(app):
    with TestClient(app) as client:
        user_token = utils.reader_token(client)
        client.headers = {"Authorization": f"Bearer {user_token['access_token']}"}
        yield client


@pytest.fixture
def reg_public_client(app):
    with TestClient(app) as client:
        token = utils.public_token(client)
        client.headers = {"Authorization": f"Bearer {token['access_token']}"}
        yield client


@pytest.fixture
def public_client(app):
    with TestClient(app) as client:
        yield client


@pytest.fixture
def client_local(db):
    class Reg:
        def get(self, *args):
            return "./ping"

    def override_get_tile_registry():
        return Reg()

    app = create_app()
    app.dependency_overrides[get_tile_registry] = override_get_tile_registry

    with TestClient(app) as client:
        yield client


@pytest.fixture
def client_lookup(
    client,
    admin_client,
    user_admin_client,
    readonly_client,
    client_local,
    public_client,
    reg_public_client,
):
    return {
        "client": client,
        "admin_client": admin_client,
        "user_admin_client": user_admin_client,
        "editor_client": client,
        "readonly_client": readonly_client,
        "reg_public_client": reg_public_client,
        "public_client": public_client,
        "client_local": client_local,
    }


@pytest.fixture()
def mock_send_email_to_user(monkeypatch):
    async def _mock_send_email(*args, **kwargs):
        print("fake email sent.")
        return

    monkeypatch.setattr(email, "send_email_to_user", _mock_send_email)
