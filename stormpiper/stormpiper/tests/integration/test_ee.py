import pytest

from .. import utils as test_utils


@pytest.mark.integration
@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/tileserver/esri/11/355/821/a",
        "/api/rest/tileserver/carto-db/9/89/206/b",
    ],
)
@test_utils.with_ee_login
def test_tileserver_api_response(client, route):
    response = client.get(route)
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/tileserver/redirect/esri/11/355/821/a",
        "/api/rest/tileserver/redirect/carto-db/9/89/206/b",
    ],
)
@test_utils.with_ee_login
def test_redirect_tileserver_api_response(client_local, route):
    client = client_local
    user_token = test_utils.user_token(client)
    response = client.get(
        route,
        follow_redirects=False,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code == 307, response.text


@pytest.mark.integration
@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/tileserver/no_server_expected_here/11/355/821/a",
        "/api/rest/tileserver/redirect/no_server_expected_here/11/355/821/a",
    ],
)
@test_utils.with_ee_login
def test_tileserver_api_response_404(client, route):
    response = client.get(route, follow_redirects=False)
    assert response.status_code == 404, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.integration
@pytest.mark.parametrize(
    "long,lat",
    [
        (-121.756163642, 46.85166326),
    ],
)
@test_utils.with_ee_login
def test_elevation(client, long, lat):
    response = client.get(f"/api/rest/spatial/ee/elevation?long={long}&lat={lat}")
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
