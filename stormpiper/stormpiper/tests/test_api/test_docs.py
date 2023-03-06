def test_docs(admin_client):
    response = admin_client.get("/docs")
    assert response.status_code == 200
