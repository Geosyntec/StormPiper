def test_table(client):
    response = client.get(f"/api/rest/table/tmnt_attr/is_dirty")
    assert 200 == response.status_code, response.content
