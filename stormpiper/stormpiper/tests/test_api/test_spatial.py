import pytest


@pytest.mark.integration
@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/tileserver/esri/11/355/821/a",
        "/api/rest/tileserver/carto-db/9/89/206/b",
    ],
)
def test_tileserver_api_response(client, route, user_token):
    response = client.get(
        route, headers={"Authorization": f"Bearer {user_token['access_token']}"}
    )
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.integration
@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/tileserver/redirect/esri/11/355/821/a",
        "/api/rest/tileserver/redirect/carto-db/9/89/206/b",
    ],
)
def test_redirect_tileserver_api_response(client, route, user_token):
    response = client.get(
        route,
        allow_redirects=False,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code == 307, response.text


@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/tileserver/no_server_expected_here/11/355/821/a",
        "/api/rest/tileserver/redirect/no_server_expected_here/11/355/821/a",
    ],
)
def test_tileserver_api_response_404(client, route, user_token):
    response = client.get(
        route,
        allow_redirects=False,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
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
def test_elevation(client, long, lat, user_token):
    response = client.get(
        f"/api/rest/spatial/ee/elevation?long={long}&lat={lat}",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )


def test_assets(client, user_token):
    response = client.get(
        "/api/rest/spatial/ee/assets",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
