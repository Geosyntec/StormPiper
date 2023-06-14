def test_docs(admin_client):
    response = admin_client.get("/api/docs")
    assert response.status_code == 200
