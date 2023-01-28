def test_get_reference_context(client):
    response = client.get(f"/api/rest/reference/context")
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()

    assert all(i in rsp_json.keys() for i in ["state", "region", "version"])
