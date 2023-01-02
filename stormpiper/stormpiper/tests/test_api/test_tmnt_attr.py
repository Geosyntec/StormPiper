import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "altid, blob",
    [
        (
            "SWFA-100018",
            {"capital_cost": 450000},
        )
    ],
)
def test_npv_api_response_altid(client, altid, blob):
    user_token = test_utils.user_token(client)

    route = f"/api/rest/tmnt_attr/{altid}"
    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
        json=blob,
    )

    response = client.get(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    rjson = response.json()
    res = rjson.get("capital_cost")
    exp = blob.get("capital_cost")

    ## cleanup
    empty_blob = {k: None for k in blob.keys()}
    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
        json=empty_blob,
    )

    assert response.status_code < 400, response.content
    assert (abs(exp - res) / exp) < 1e-6, (res, exp)
