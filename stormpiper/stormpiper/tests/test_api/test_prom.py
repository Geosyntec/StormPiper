def test_prom(admin_client):
    data = {"criteria": [{"weight": 2, "criteria": "area_acres", "direction": 1}]}
    route = "/api/rpc/calculate_subbasin_promethee_prioritization"
    response = admin_client.post(route, json=data)
    assert response.status_code == 200
    rdata = response.json()

    assert len(rdata["result"]) > 1, rdata
