import pytest


@pytest.mark.parametrize("f", ["json", "geojson"])
@pytest.mark.parametrize("limit", [3, 5])
@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/subbasin/token/",
        "/api/rest/tmnt_facility/token/",
        "/api/rest/tmnt_delineation/token/",
    ],
)
def test_get_many_data_with_readonly_token(
    public_client, readonly_token, route, f, limit
):
    client = public_client

    response = client.get(f"{route}{readonly_token}?f={f}&limit={limit}")

    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    if f == "geojson":
        assert len(rsp_json["features"]) == limit
    else:
        assert len(rsp_json) == limit


@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/subbasin/WS_03/token/{token}",
        "/api/rest/tmnt_facility/SWFA-100018/token/{token}",
        "/api/rest/tmnt_delineation/SWFC-100067/token/{token}",
        "/api/rest/tmnt_delineation/SWFC-100067/token/{token}?f=geojson",
        "/api/rest/results/SWFA-100018/token/{token}",
        "/api/rest/results/token/{token}?limit=1",
    ],
)
def test_get_data_with_readonly_token(public_client, readonly_token, route):
    client = public_client

    response = client.get(route.format(token=readonly_token))

    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    if "geojson" in route:
        assert len(rsp_json["features"]) == 1, rsp_json
    elif isinstance(rsp_json, list):
        assert "node_id" in rsp_json[0], rsp_json
    elif isinstance(rsp_json, dict):
        assert "node_id" in rsp_json, rsp_json
