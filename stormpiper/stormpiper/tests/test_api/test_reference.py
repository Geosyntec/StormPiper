from .. import utils as test_utils


def test_get_reference_context(client):
    user_token = test_utils.user_token(client)
    response = client.get(
        f"/api/rest/reference/context",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()

    assert all(i in rsp_json.keys() for i in ["state", "region", "version"])
