import pytest


@pytest.mark.parametrize(
    "route",
    [
        "/api/tileserver/esri/11.0/355.0/821.0/a",
        "/api/tileserver/carto-db/9/89/206/b",
    ],
)
def test_tileserver_api_response(client, route):
    response = client.get(route, allow_redirects=False)
    assert response.status_code == 307, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.parametrize(
    "route",
    [
        "/api/file_tileserver/esri/11.0/355.0/821.0/a",
        "/api/file_tileserver/carto-db/9/89/206/b",
    ],
)
def test_file_tileserver_api_response(client, route):
    response = client.get(route)
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.parametrize(
    "route",
    [
        "/api/tileserver/no_server_expected_here/11.0/355.0/821.0/a",
        "/api/file_tileserver/no_server_expected_here/11.0/355.0/821.0/a",
    ],
)
def test_tileserver_api_response_404(client, route):
    response = client.get(route, allow_redirects=False)
    assert response.status_code == 404, (
        response,
        response.content,
        response.status_code,
    )
