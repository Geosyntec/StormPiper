import uuid

import pytest


def test_create_user(client, admin_token):
    # create it
    response = client.post(
        "/auth/register",
        json={"email": "new_user@example.com", "password": "supersafepassword"},
    )
    assert 200 <= response.status_code <= 400, response.text
    data = response.json()
    assert data["email"] == "new_user@example.com"
    assert "id" in data
    user_id = data["id"]

    # check it
    response = client.get(
        f"/api/rest/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token['access_token']}"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "new_user@example.com"
    assert data["id"] == user_id


@pytest.mark.parametrize(
    "route,method,blob,authorized",
    [
        ("/api/rest/users/me", "get", {}, True),
        ("/api/rest/users/me", "patch", {"is_superuser": True}, True),
        ("/api/rest/users/me", "patch", {"is_verified": True}, True),
        ("/api/rest/users/me", "patch", {"is_active": True}, True),
        ("/api/rest/users/me", "patch", {"first_name": str(uuid.uuid4())}, True),
        ("/api/rest/users/me", "patch", {"role": 100}, False),
        ("/api/rest/users/0001", "get", {}, False),
    ],
)
def test_user_mods(client, route, method, blob, authorized, user_token):

    base_response = client.get(
        "/api/rest/users/me",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    methodf = getattr(client, method)
    response = methodf(
        route,
        json=blob,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    if not authorized:
        assert response.status_code >= 401, (response.status_code, response.content)
    else:
        assert response.status_code == 200, (response.status_code, response.content)
        base_data = base_response.json()
        data = response.json()

        for noop in ["is_superuser", "is_verified", "is_active"]:
            assert data[noop] == base_data[noop], (data, base_data)

        for mutable in ["first_name"]:
            if mutable in blob:
                assert blob[mutable] == data[mutable] != base_data[mutable], (
                    blob,
                    data,
                    base_data,
                )