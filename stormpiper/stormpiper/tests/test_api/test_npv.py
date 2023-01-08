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
    response = client.post("/api/rpc/calculate_net_present_value", json=blob)
    assert response.status_code < 400, response.content


@pytest.mark.parametrize("method", ["get", "post"])
@pytest.mark.parametrize("altid", ["SWFA-100018"])
def test_npv_api_response_altid_no_server_error(client, altid, method):
    caller = getattr(client, method)
    response = caller(f"/api/rpc/calculate_net_present_value/{altid}")
    assert response.status_code < 500, response.content


@pytest.mark.parametrize(
    "altid, blob, exp",
    [
        # this patch is complete for npv calcs.
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
        # incomplete npv db transaction should set npv to none
        # you are here. rpc route should fail if fields are missing? rest route should pass?
        (
            "SWFA-100018",
            {
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
            },
            None,
        ),
        # invalid request (missing a required non-null parameter ) should set npv to none
        (
            "SWFA-100018",
            {
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": None,
            },
            None,
        ),
    ],
)
def test_npv_api_response_altid(client, altid, blob, exp):

    route = f"/api/rest/tmnt_attr/{altid}"
    p_response = client.patch(route, json=blob)

    route = f"/api/rpc/calculate_net_present_value/{altid}"
    response = client.get(route)

    rjson = response.json()

    ## cleanup
    empty_blob = {k: None for k in blob.keys()}
    route = f"/api/rest/tmnt_attr/{altid}"
    _ = client.patch(route, json=empty_blob)

    if exp is None:
        assert rjson.get("net_present_value") is None, rjson
        assert rjson.get("detail"), rjson
    else:
        res = rjson.get("net_present_value")
        assert (abs(exp - res) / exp) < 0.01, (res, exp)
