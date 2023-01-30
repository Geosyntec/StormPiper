import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "altid, blob, exp_npv",
    [
        # complete npv patch
        (
            "SWFA-100018",
            {
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
            },
            -739400.67,
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
            -739400.67,
        ),
    ],
)
def test_npv_api_response_altid(client, altid, blob, exp_npv):
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

    res = rjson.get("capital_cost")
    exp = blob.get("capital_cost")

    assert response.status_code < 400, response.content
    assert (abs(exp - res) / exp) < 1e-6, (res, exp)

    npv = rjson.get("net_present_value")
    if exp_npv is None:
        assert npv is None
    else:
        assert (abs(exp_npv - npv) / exp_npv) < 1e-6, (npv, exp_npv)
