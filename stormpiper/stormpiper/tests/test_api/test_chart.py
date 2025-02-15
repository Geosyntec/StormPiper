import pytest


@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/chart/cost_timeseries",
        "/api/rest/chart/cost_timeseries?node_id=SWFA-100018",
    ],
)
def test_chart_spec_json(client, route):
    response = client.get(route)
    assert response.status_code == 200, response.content
    rjson = response.json()
    assert rjson["data"]["url"] is not None, response.content


def test_chart_spec_html(client):
    node_id = "SWFA-100018"
    route = f"/api/rest/chart/cost_timeseries?f=html&node_id={node_id}"
    response = client.get(route)
    assert response.status_code == 200, response.content
    assert "doctype" in response.text.lower(), response.content


def test_chart_data(client):
    node_id = "SWFA-100018"

    data = {
        "capital_cost": 450000,
        "om_cost_per_yr": 6000,
        "replacement_cost": 225000,
        "lifespan_yrs": 15,
    }
    route = f"/api/rest/tmnt_attr/{node_id}"
    p_response = client.patch(route, json=data)
    assert p_response.status_code == 200, p_response.content

    route = f"/api/rest/chart/{node_id}/cost_timeseries/data"
    response = client.get(route)
    assert response.status_code == 200, response.content
    rjson = response.json()
    assert len(rjson) > 1, (rjson, response.content)

    ## cleanup
    empty_blob = {k: None for k in data.keys()}
    route = f"/api/rest/tmnt_attr/{node_id}"
    _ = client.patch(route, json=empty_blob)
