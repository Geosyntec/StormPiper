import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "node_id, blob, exp_pv",
    [
        # complete pv patch
        (
            "SWFA-100018",
            {
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
            },
            1500255,
        ),
        # incomplete patch
        ("SWFA-100018", {"capital_cost": 450001}, None),
        # new cost attr
        (
            "SWFA-100030",
            {
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
            },
            1500255,
        ),
    ],
)
def test_pv_api_response_node_id(client, node_id, blob, exp_pv):
    user_token = test_utils.user_token(client)

    route = f"/api/rest/tmnt_attr/{node_id}"
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

    res = rjson.get("capital_cost")
    exp = blob.get("capital_cost")

    assert response.status_code < 400, response.content
    assert abs(exp - res) < 1, (res, exp)

    pv = rjson.get("present_value_total_cost")
    if exp_pv is None:
        assert pv is None
    else:
        assert abs(exp_pv - pv) < 1, (pv, exp_pv)
