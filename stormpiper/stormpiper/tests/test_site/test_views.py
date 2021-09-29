import pytest


@pytest.mark.parametrize(
    "route",
    ["/tileserver"],
)
def test_tileserver_view_response(client, route):
    response = client.get(route)
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
