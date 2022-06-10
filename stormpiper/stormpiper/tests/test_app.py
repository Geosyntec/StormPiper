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
