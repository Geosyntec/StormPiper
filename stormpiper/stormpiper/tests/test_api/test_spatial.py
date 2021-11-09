import pytest


@pytest.mark.parametrize(
    "route",
    [
        "/api/tileserver/esri/11/355/821/a",
        "/api/tileserver/carto-db/9/89/206/b",
    ],
)
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
        "/api/tileserver_redirect/esri/11/355/821/a",
        "/api/tileserver_redirect/carto-db/9/89/206/b",
    ],
)
def test_redirect_tileserver_api_response(client, route):
    response = client.get(route, allow_redirects=False)
    assert response.status_code == 307, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.parametrize(
    "route",
    [
        "/api/tileserver/no_server_expected_here/11/355/821/a",
        "/api/tileserver_redirect/no_server_expected_here/11/355/821/a",
    ],
)
def test_tileserver_api_response_404(client, route):
    response = client.get(route, allow_redirects=False)
    assert response.status_code == 404, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.parametrize(
    "long,lat",
    [
        (-121.756163642, 46.85166326),
    ],
)
def test_elevation(client, long, lat):
    response = client.get(f"/api/elevation?long={long}&lat={lat}")
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )


def test_assets(client):
    response = client.get("/api/spatial/assets")
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
