import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "blob",
    [
        {
            "planning_horizon_yrs": 50,
            "discount_rate": 0.05,
            "capital_cost": 450000,
            "om_cost_per_yr": 6000,
            "replacement_cost": 225000,
            "lifespan_yrs": 15,
        },
    ],
)
def test_npv_api_response(client, blob):
    user_token = test_utils.user_token(client)
    response = client.post(
        "/api/rpc/calculate_net_present_value",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
        json=blob,
    )
    assert response.status_code < 400, response.content


@pytest.mark.parametrize("method", ["get", "post"])
@pytest.mark.parametrize("altid", ["SWFA-100018"])
def test_npv_api_response_altid_no_server_error(client, altid, method):
    user_token = test_utils.user_token(client)
    caller = getattr(client, method)
    response = caller(
        f"/api/rpc/calculate_net_present_value/{altid}",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert response.status_code < 500, response.content


@pytest.mark.parametrize(
    "altid, blob, exp",
    [
        (
            "SWFA-100018",
            {
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
            },
            -739400.67,
        )
    ],
)
def test_npv_api_response_altid(client, altid, blob, exp):
    user_token = test_utils.user_token(client)

    route = f"/api/rest/tmnt_attr/{altid}"
    p_response = client.patch(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
        json=blob,
    )

    route = f"/api/rpc/calculate_net_present_value/{altid}"
    response = client.get(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    rjson = response.json()
    res = rjson.get("net_present_value", 1e9)

    ## cleanup
    empty_blob = {k: None for k in blob.keys()}
    route = f"/api/rest/tmnt_attr/{altid}"
    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
        json=empty_blob,
    )

    assert response.status_code < 400, (response.content, p_response.content)
    assert (abs(exp - res) / exp) < 0.01, (res, exp)
