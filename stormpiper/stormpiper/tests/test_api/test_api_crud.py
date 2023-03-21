import pytest

from .. import utils as test_utils


@pytest.mark.parametrize(
    "route, blob, cleanup_blob",
    [
        (
            "/api/rest/tmnt_attr/SWFA-100018",
            {"capital_cost": 450000},
            {"capital_cost": None},
        ),
        (
            "/api/rest/global_setting/discount_rate",  # <- this one requires admin rights
            {"value": "0.08"},
            {"value": "0.05"},
        ),
        (
            "/api/rest/tmnt_source_control/1",
            {"activity": "test"},
            {"activity": "Street Sweeping"},
        ),
    ],
)
def test_crud_patch(client, route, blob, cleanup_blob):
    token = test_utils.admin_token(client)

    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
        json=blob,
    )

    response = client.get(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
    )

    rjson = response.json()
    keys = blob.keys()

    ## cleanup
    _ = client.patch(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
        json=cleanup_blob,
    )

    assert response.status_code < 400, (response.content, route, blob, cleanup_blob)
    for k in keys:
        res = rjson.get(k)
        exp = blob.get(k)

        assert res == exp, (res, exp, rjson)


@pytest.mark.parametrize(
    "route, blob, idvar",
    [
        (
            "/api/rest/global_setting",  # <- this one requires admin rights
            {"variable": "test", "value": "test"},
            "variable",
        ),
        (
            "/api/rest/tmnt_source_control",
            {
                "activity": "test",
                "subbasin": "test",
                "direction": "Upstream",
                "order": 0,
                "variable": "tss",
                "percent_reduction": 50,
            },
            "id",
        ),
        (
            "/api/rest/scenario",
            {"name": "empty scenario"},
            "id",
        ),
    ],
)
def test_crud_create_and_delete(client, route, blob, idvar):
    token = test_utils.admin_token(client)

    # create resource
    response = client.post(
        route,
        headers={"Authorization": f"Bearer {token['access_token']}"},
        json=blob,
    )

    assert response.status_code < 400, (response.content, route, blob)
    id = response.json().get(idvar, None)
    assert id is not None, response.content

    # check create resource
    response = client.get(
        route + f"/{id}",
        headers={"Authorization": f"Bearer {token['access_token']}"},
    )

    assert response.status_code < 400, (response.content, route, blob)
    id = response.json().get(idvar, None)
    assert id is not None, response.content

    ## delete resource
    response = client.delete(
        route + f"/{id}",
        headers={"Authorization": f"Bearer {token['access_token']}"},
    )

    assert response.status_code < 400, (response.content, route, blob)

    # check delete resource
    response = client.get(
        route + f"/{id}",
        headers={"Authorization": f"Bearer {token['access_token']}"},
    )

    assert response.status_code > 400, (response.content, route, blob)
    detail = response.json().get("detail", None)
    assert detail is not None, response.content


@pytest.mark.parametrize(
    "route",
    [
        "/api/rest/scenario",
        "/api/rest/tmnt_source_control",
        "/api/rest/tmnt_facility",
        "/api/rest/tmnt_attr",
        "/api/rest/tmnt_delineation",
        "/api/rest/global_setting",
    ],
)
def test_crud_get_all(admin_client, route):
    response = admin_client.get(route)
    rjson = response.json()

    assert isinstance(rjson, list)
