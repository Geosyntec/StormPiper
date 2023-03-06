import pytest

from ..utils import get_my_data


@pytest.mark.parametrize("subbasin_id, exists", [("WS_03", True), ("DNE", False)])
def test_get_subbasin_by_id(client, subbasin_id, exists):
    response = client.get(f"/api/rest/subbasin/{subbasin_id}")

    if not exists:
        assert response.status_code >= 400, response.content
    else:
        assert 200 <= response.status_code < 300, response.content
        rsp_json = response.json()
        assert all(i in rsp_json.keys() for i in ["basinname", "subbasin"])


@pytest.mark.parametrize("f", ["json", "geojson"])
@pytest.mark.parametrize("limit", [3, 5])
def test_get_all_subbasins(client, f, limit):
    response = client.get(f"/api/rest/subbasin?f={f}&limit={limit}")

    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    if f == "geojson":
        assert len(rsp_json["features"]) == limit
    else:
        assert len(rsp_json) == limit


@pytest.mark.parametrize("f", ["json", "geojson"])
@pytest.mark.parametrize("limit", [3, 5])
def test_get_subbasin_with_token(readonly_client, f, limit):
    readonly_user_data = get_my_data(readonly_client)
    token = readonly_user_data.get("readonly_token", None)
    response = readonly_client.get(
        f"/api/rest/subbasin/token/{token}?f={f}&limit={limit}"
    )

    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    if f == "geojson":
        assert len(rsp_json["features"]) == limit
    else:
        assert len(rsp_json) == limit


@pytest.mark.parametrize(
    "method, route, client_name, token, authorized",
    [
        ("get", "/api/rest/subbasin/WS_03", "readonly_client", False, True),
        ("get", "/api/rest/subbasin/WS_03", "public_client", False, False),
        ("get", "/api/rest/subbasin", "readonly_client", False, True),
        ("get", "/api/rest/subbasin", "public_client", False, False),
        ("get", "/api/rest/subbasin/token", "readonly_client", True, True),
        ("get", "/api/rest/subbasin/token", "public_client", True, False),
    ],
)
@pytest.mark.parametrize("f", ["json", "geojson"])
def test_get_subbasin_access_with_token(
    client_lookup,
    method,
    route,
    client_name,
    token,
    authorized,
    f,
):
    client = client_lookup.get(client_name)
    if token:
        my_data = get_my_data(client)
        token = my_data.get("readonly_token", None)
        route += f"/{token}"
    method = getattr(client, method)
    route += f"/?f={f}"
    response = method(route)

    if not authorized:
        assert response.status_code >= 400, (response.content, route)
    else:
        assert 200 <= response.status_code < 300, (response.content, route)


def _good_token(client):
    my_data = get_my_data(client)
    token = my_data.get("readonly_token", None)
    return token, True


def _random_uuid_token(*_, **__):
    token = "1dc37681-440b-403e-9c72-d9d32318a347"
    return token, False


def _invalid_uuid_token(*_, **__):
    token = "1dc37681-440b-403e-9c72-d9d323*8a347"
    return token, False


def _not_uuid_token(*_, **__):
    token = "not a uuid"
    return token, False


@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/subbasin/token",
    ],
)
@pytest.mark.parametrize(
    "token_getter",
    [
        _good_token,
        _random_uuid_token,
        _invalid_uuid_token,
        _not_uuid_token,
    ],
)
def test_good_bad_token(
    client_local,
    readonly_client,
    route,
    token_getter,
):
    client = client_local
    token, authorized = token_getter(readonly_client)

    route += f"/{token}"
    response = client.get(route)

    if not authorized:
        assert response.status_code >= 400, (response.content, route)
    else:
        assert 200 <= response.status_code < 300, (response.content, route)
