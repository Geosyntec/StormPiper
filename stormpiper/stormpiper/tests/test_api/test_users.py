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
    response = client.post("/auth/register", json=new_user_blob)
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


def _patch_me_route(*args, **kwargs):
    return "/api/rest/users/me"


def _patch_admin_route(client, *args, **kwargs):
    token = test_utils.admin_token(client)
    headers = {"Authorization": f"Bearer {token['access_token']}"}
    response = client.get("/api/rest/users/me", headers=headers)
    me_data = response.json()
    _id = me_data["id"]

    return f"/api/rest/users/{_id}"


def _patch_public_route(client, *args, **kwargs):
    token = test_utils.admin_token(client)
    headers = {"Authorization": f"Bearer {token['access_token']}"}
    response = client.get("/api/rest/users/", headers=headers)
    user_data = response.json()

    pub_user = [data for data in user_data if data["role"] == "public"][-1]
    _id = pub_user["id"]

    return f"/api/rest/users/{_id}"


@pytest.mark.parametrize(
    "method, route_getter, client_name, blob, exp_blob, authorized",
    [
        # as readonly
        (  # can't change
            "patch",
            _patch_me_route,
            "readonly_client",
            {"role": "none"},
            {"role": "reader"},
            False,
        ),
        (  # can't change other
            "patch",
            _patch_public_route,
            "readonly_client",
            {"role": "none"},
            {},  # readonly cant access other user data
            False,
        ),
        # as editor
        (  # can't change
            "patch",
            _patch_me_route,
            "editor_client",
            {"role": "none"},
            {"role": "editor"},
            False,
        ),
        (  # can't change other
            "patch",
            _patch_public_route,
            "editor_client",
            {"role": "none"},
            {},  # readonly cant access other user data
            False,
        ),
        # as user admin
        (  # can't change
            "patch",
            _patch_me_route,
            "user_admin_client",
            {"role": "none"},
            {"role": "user_admin"},
            False,  # can't change self
        ),
        (  # can change other lower permissioned users
            "patch",
            _patch_public_route,
            "user_admin_client",
            {"role": "none"},
            {"role": "none"},
            True,
        ),
        (  # Can't change users with higher privileges
            "patch",
            _patch_admin_route,
            "user_admin_client",
            {"role": "none"},
            {"role": "admin"},
            False,  # cannot
        ),
        # as admin
        (  # can't patch self via me route
            "patch",
            _patch_me_route,
            "admin_client",
            {"role": "none"},
            {"role": "admin"},
            False,
        ),
        (  # can't patch self via id route
            "patch",
            _patch_admin_route,
            "admin_client",
            {"role": "none"},
            {"role": "admin"},
            False,
        ),
        (  # can change other lower permissioned users
            "patch",
            _patch_public_route,
            "admin_client",
            {"role": "public"},
            {"role": "public"},
            True,
        ),
    ],
)
def test_patch_user(
    admin_client,
    client_lookup,
    method,
    route_getter,
    client_name,
    blob,
    exp_blob,
    authorized,
):
    client = client_lookup.get(client_name)
    route = route_getter(client)

    # init
    b_data = admin_client.get(route).json()

    # test
    method = getattr(client, method)
    response = method(route, json=blob)

    # check for change or not
    data = client.get(route).json()

    # cleanup
    _ = admin_client.patch(route, json=b_data).json()

    if not authorized:
        assert response.status_code >= 400, (response.content, route)
    else:
        assert 200 <= response.status_code < 300, (response.content, route)

    if exp_blob:
        for k, v in exp_blob.items():
            assert data[k] == v, (route, blob, data, client_name)
