import pytest


@pytest.mark.parametrize(
    "route",
    ["/app", "/", "/app/map/tmnt/SWFA-100030"],
)
def test_frontend_app(client, route):
    response = client.get(route)
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )


@pytest.mark.parametrize("client_name", ["client", "client_local"])
def test_ping(client_lookup, client_name):
    client = client_lookup[client_name]
    response = client.get("/ping")
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
    data = response.json()
    # make sure api doesn't retutn an error json response
    assert "version" in data, data
