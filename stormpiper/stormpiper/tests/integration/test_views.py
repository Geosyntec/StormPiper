import pytest

from .. import utils as test_utils


@pytest.mark.integration
@pytest.mark.parametrize(
    "route",
    ["/tileserver"],
)
@test_utils.with_ee_login
def test_tileserver_view_response(client_local, route):
    user_token = test_utils.user_token(client_local)
    response = client_local.get(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code == 200, (
        response,
        response.content,
        response.status_code,
    )
