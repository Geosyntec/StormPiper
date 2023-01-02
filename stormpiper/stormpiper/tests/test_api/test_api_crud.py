import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "route, blob, cleanup_blob",
    [
        (
            "/api/rest/tmnt_attr/SWFA-100018",
            {"capital_cost": 450000},
            {"capital_cost": None},
        ),
        (
            "/api/rest/global_setting/discount_rate",  # <- this one requires admin rights
            {"value": "0.08"},
            {"value": "0.05"},
        ),
        (
            "/api/rest/tmnt_source_control/1",
            {"activity": "test"},
            {"activity": "Street Sweeping"},
        ),
    ],
)
def test_crud_patch(client, route, blob, cleanup_blob):
    token = test_utils.admin_token(client)

    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
        json=blob,
    )

    response = client.get(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
    )

    rjson = response.json()
    keys = blob.keys()

    ## cleanup
    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
        json=cleanup_blob,
    )

    assert response.status_code < 400, (response.content, route, blob, cleanup_blob)
    for k in keys:
        res = rjson.get(k)
        exp = blob.get(k)

        assert res == exp, (res, exp, rjson)
