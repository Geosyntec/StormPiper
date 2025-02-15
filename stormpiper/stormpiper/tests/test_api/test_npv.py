import pytest


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
            "cost_basis_year": 2023,
            "inflation_rate": 0.022,
        },
    ],
)
def test_pv_api_response(client, blob):
    response = client.post("/api/rpc/calculate_present_cost", json=blob)
    assert response.status_code < 400, response.content


@pytest.mark.parametrize("method", ["get", "post"])
@pytest.mark.parametrize("node_id", ["SWFA-100018"])
def test_pv_api_response_node_id_no_server_error(client, node_id, method):
    caller = getattr(client, method)
    response = caller(f"/api/rpc/calculate_present_cost/{node_id}")
    assert response.status_code < 500, response.content


@pytest.mark.parametrize(
    "node_id, blob, exp",
    [
        # this patch is complete for pv calcs.
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
        # incomplete pv db transaction should set pv to none
        # you are here. rpc route should fail if fields are missing? rest route should pass?
        (
            "SWFA-100018",
            {
                "om_cost_per_yr": 6001,
            },
            None,
        ),
        # invalid request (missing a required non-null parameter ) should set pv to none
        (
            "SWFA-100018",
            {
                "capital_cost": 450002,
                "om_cost_per_yr": None,
                "replacement_cost": 22500,
            },
            None,
        ),
    ],
)
def test_pv_api_response_node_id(client, node_id, blob, exp):
    route = f"/api/rest/tmnt_attr/{node_id}"
    p_response = client.patch(route, json=blob)
    assert p_response.status_code == 200, p_response

    route = f"/api/rpc/calculate_present_cost/{node_id}"
    response = client.post(route)

    rjson = response.json()

    ## cleanup
    empty_blob = {k: None for k in blob.keys()}
    route = f"/api/rest/tmnt_attr/{node_id}"
    _ = client.patch(route, json=empty_blob)

    if exp is None:
        assert rjson.get("present_value_total_cost") is None, rjson
        assert rjson.get("detail"), (rjson, response.content)
    else:
        res = rjson.get("present_value_total_cost")
        assert (abs(exp - res) / exp) < 0.01, (rjson, exp, response.content)
