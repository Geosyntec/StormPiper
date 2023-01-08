import pytest

from ..utils import get_my_data


@pytest.mark.parametrize(
    "method, route, client_name, authorized",
    [
        ("get", "/api/rest/tmnt_delineation/", "client", True),
        ("get", "/api/rest/tmnt_delineation/", "readonly_client", False),
        ("get", "/api/rest/tmnt_delineation/SWFC-100001/", "client", True),
        ("get", "/api/rest/tmnt_delineation/SWFC-100001/", "readonly_client", False),
    ],
)
@pytest.mark.parametrize("f", ["json", "geojson"])
def test_get_tmnt_facility_delin_access(
    client_lookup, method, route, client_name, authorized, f
):
    client = client_lookup.get(client_name)
    method = getattr(client, method)
    response = method(route + f"?f={f}")

    if not authorized:
        assert response.status_code >= 400, response.content
    else:
        assert 200 <= response.status_code < 300, response.content
        rsp_json = response.json()
        if f == "geojson":
            assert len(rsp_json["features"])
        else:
            assert len(rsp_json)


@pytest.mark.parametrize(
    "method, route, client_name, authorized",
    [
        ("get", "/api/rest/tmnt_delineation/token", "client", True),
        ("get", "/api/rest/tmnt_delineation/token", "readonly_client", True),
        ("get", "/api/rest/tmnt_delineation/token", "public_client", False),
        ("get", "/api/rest/tmnt_delineation/SWFC-100001/token", "client", True),
        (
            "get",
            "/api/rest/tmnt_delineation/SWFC-100001/token",
            "readonly_client",
            True,
        ),
        (
            "get",
            "/api/rest/tmnt_delineation/SWFC-100001/token",
            "public_client",
            False,
        ),
    ],
)
@pytest.mark.parametrize("f", ["json", "geojson"])
def test_get_tmnt_facility_delin_access_token(
    client_lookup, method, route, client_name, authorized, f
):
    client = client_lookup.get(client_name)
    my_data = get_my_data(client)
    token = my_data.get("access_token", None)
    method = getattr(client, method)
    route += f"/{token}/?f={f}"
    response = method(route)

    if not authorized:
        assert response.status_code >= 400, (response.content, route, my_data)
    else:
        assert 200 <= response.status_code < 300, (response.content, route, my_data)
        rsp_json = response.json()
        if f == "geojson":
            assert len(rsp_json["features"])
        else:
            assert len(rsp_json)
