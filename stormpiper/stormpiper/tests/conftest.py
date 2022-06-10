import pytest
from fastapi.testclient import TestClient

from stormpiper.factory import create_app
from stormpiper.database.connection import get_async_session
from stormpiper.core.config import settings

from . import utils


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "integration: mark test as requireing a data connection"
    )


@pytest.fixture(scope="module")
def client():
    utils.reset_db()
    app = create_app()
    app.dependency_overrides[get_async_session] = utils.get_async_session
    with TestClient(app) as client:
        yield client
    utils.clear_db()


@pytest.fixture(scope="module")
def admin_token(client):
    response = utils.get_token(
        client, "admin@geosyntec.com", settings.ADMIN_ACCOUNT_PASSWORD
    )

    yield response.json()


@pytest.fixture(scope="module")
def user_token(client):
    response = utils.get_token(
        client, "existing_user@example.com", "existing_user_password"
    )

    yield response.json()
