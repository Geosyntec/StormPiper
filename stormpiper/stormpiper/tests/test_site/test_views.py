import pytest


@pytest.mark.parametrize(
    "route",
    ["/tileserver"],
)
def test_tileserver_view_response(client, route, user_token):
    response = client.get(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
