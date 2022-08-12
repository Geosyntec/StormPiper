import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "altid,exists", [("SWFA-100018", True), ("SWFA-1000dd", False)]
)
def test_get_tmnt_facility_by_altid(client, altid, exists):
    user_token = test_utils.user_token(client)
    response = client.get(
        f"/api/rest/tmnt_facility/{altid}",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    if not exists:
        assert response.status_code >= 400, response.content
    else:
        assert 200 <= response.status_code < 300, response.content
        rsp_json = response.json()
        assert all(i in rsp_json.keys() for i in ["node_id", "altid"])


@pytest.mark.parametrize("f", ["json", "geojson"])
@pytest.mark.parametrize("limit", [3, 5])
def test_get_all_tmnt_facility(client, f, limit):
    user_token = test_utils.user_token(client)
    response = client.get(
        f"/api/rest/tmnt_facility?f={f}&limit={limit}",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    if f == "geojson":
        assert len(rsp_json["features"]) == limit
    else:
        assert len(rsp_json) == limit
