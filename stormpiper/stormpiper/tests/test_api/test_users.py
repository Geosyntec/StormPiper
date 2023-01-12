import uuid

import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "new_user_blob, exp",
    [
        (
            {"email": "new_user@example.com", "password": "supersafepassword"},
            {"email": "new_user@example.com", "role": "public"},
        ),
        (
            {
                "email": "new_other_user@example.com",
                "password": "supersafepassword",
                "role": "admin",
            },
            {"email": "new_other_user@example.com", "role": "public"},
        ),
    ],
)
def test_create_user(public_client, new_user_blob, exp):
    client = public_client
    admin_token = test_utils.admin_token(client)
    # create it
    response = client.post(
        "/auth/register",
        json=new_user_blob,
    )
    assert 200 <= response.status_code <= 400, response.text
    data = response.json()
    # assert data["email"] == "new_user@example.com"
    assert "id" in data
    user_id = data["id"]

    for k, v in exp.items():
        assert data[k] == v, (data[k], v)

    # check it
    response = client.get(
        f"/api/rest/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token['access_token']}"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["id"] == user_id

    for k, v in exp.items():
        assert data[k] == v, (data[k], v)


@pytest.mark.parametrize(
    "route,method,blob,authorized",
    [
        ("/api/rest/users/me", "get", {}, True),
        ("/api/rest/users/me", "patch", {"is_superuser": True}, True),
        ("/api/rest/users/me", "patch", {"is_verified": True}, True),
        ("/api/rest/users/me", "patch", {"is_active": True}, True),
        ("/api/rest/users/me", "patch", {"first_name": str(uuid.uuid4())}, True),
        ("/api/rest/users/me", "patch", {"readonly_token": 100}, True),
        ("/api/rest/users/me", "patch", {"role": 100}, False),
        ("/api/rest/users/0001", "get", {}, False),
    ],
)
def test_user_mods(client, route, method, blob, authorized):
    base_response = client.get("/api/rest/users/me")

    methodf = getattr(client, method)
    kwargs = {} if "get" in method.lower() else {"json": blob}
    response = methodf(route, **kwargs)

    if not authorized:
        assert response.status_code >= 401, (response.status_code, response.content)
    else:
        assert response.status_code == 200, (response.status_code, response.content)
        base_data = base_response.json()
        data = response.json()

        for noop in ["is_superuser", "is_verified", "is_active", "readonly_token"]:
            assert data[noop] == base_data[noop], (data, base_data)

        for mutable in ["first_name"]:
            if mutable in blob:
                assert blob[mutable] == data[mutable] != base_data[mutable], (
                    blob,
                    data,
                    base_data,
                )


@pytest.mark.parametrize(
    "route,method,blob,authorized",
    [
        ("/api/rest/users/readonly_token", "get", {}, True),
        ("/api/rest/users/rotate_readonly_token", "post", {}, True),
    ],
)
def test_user_mods_readonly_token(client, route, method, blob, authorized):
    base_response = client.get("/api/rest/users/me")

    methodf = getattr(client, method)
    kwargs = {} if "get" in method.lower() else {"json": blob}
    response = methodf(route, **kwargs)

    if not authorized:
        assert response.status_code >= 401, (response.status_code, response.content)
    else:
        assert response.status_code == 200, (response.status_code, response.content)
        base_data = base_response.json()
        data = response.json()

        if "rotate" in route:
            assert data["readonly_token"] != base_data["readonly_token"], (
                data,
                base_data,
            )

        else:
            assert data["readonly_token"] == base_data["readonly_token"], (
                data,
                base_data,
            )
