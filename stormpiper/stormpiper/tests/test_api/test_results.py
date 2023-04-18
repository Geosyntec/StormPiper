import pytest

from stormpiper.database.connection import engine
from stormpiper.src import tasks


@pytest.mark.parametrize("limit", [3, 5])
@pytest.mark.parametrize("ntype", ["tmnt_facility", "land_surface", None])
@pytest.mark.parametrize("epoch", ["all", "1980s", None])
def test_get_all_results(client, limit, ntype, epoch):
    route = f"/api/rest/results?limit={limit}"
    if ntype is not None:
        route += f"&ntype={ntype}"
    if epoch is not None:
        route += f"&epoch={epoch}"
    response = client.get(route)
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    assert len(rsp_json) == limit
    assert all(
        i in dct.keys()
        for dct in rsp_json
        for i in ["node_id", "epoch", "facility_type"]
    )


@pytest.mark.parametrize(
    "node_id, epoch, exists",
    [
        ("SWFA-100018", None, True),
        ("SWFA-100018", "all", True),
        ("SWFA-100018", "1980s", True),
        ("SWFA-1000dd", "1980s", False),  # bad node id
        ("SWFA-100018", "dd", False),  # bad epoch
    ],
)
def test_get_result_by_node_id(client, node_id, epoch, exists):
    q = f"?epoch={epoch}" if epoch else ""
    response = client.get(f"/api/rest/results/{node_id}{q}")

    if not exists:
        assert response.status_code >= 400, response.content
    else:
        assert 200 <= response.status_code < 300, response.content
        rsp_json = response.json()
        if epoch == "all":
            assert len(rsp_json) > 1
        else:
            assert len(rsp_json) == 1
        assert all(
            i in dct.keys()
            for dct in rsp_json
            for i in ["node_id", "epoch", "facility_type"]
        )


@pytest.mark.parametrize(
    "node_id, blob, after_change_is_dirty",
    [
        # dirty the results
        (
            "SWFA-100018",
            {
                "facility_type": "bioretention_with_no_infiltration_simple",
                "captured_pct": 55,
            },
            True,
        ),
        # dont dirty the wq results
        (
            "SWFA-100018",
            {"capital_cost": 550000},
            False,
        ),
    ],
)
def test_clean_dirty_clean(client, node_id, blob, after_change_is_dirty):
    tasks.delete_and_refresh_all_results_tables(engine=engine)

    # check if db is clean
    response = client.get(f"/api/rest/results/is_dirty")
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    assert rsp_json["is_dirty"] == False, rsp_json

    # try to dirty the results by patching an attribute
    response = client.get(f"/api/rest/tmnt_attr/{node_id}")
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()

    response = client.patch(f"/api/rest/tmnt_attr/{node_id}", json=blob)
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()

    # check if dirty got set
    response = client.get(f"/api/rest/results/is_dirty")
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    assert rsp_json["is_dirty"] == after_change_is_dirty, rsp_json

    tasks.delete_and_refresh_all_results_tables(engine=engine)

    # check if dirty got cleaned
    response = client.get(f"/api/rest/results/is_dirty")
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    assert rsp_json["is_dirty"] == False, rsp_json


# # re-solve results
# response = client.get(
#     f"/api/rpc/solve_watershed",
#     headers={"Authorization": f"Bearer {user_token['access_token']}"},
# )

# def check_if_task(taskid, n_tries):

#     for i in range(n_tries):
#         response = client.get(
#             f"/api/rest/tasks/{taskid}",
#             headers={"Authorization": f"Bearer {user_token['access_token']}"},
#         )

#         rsp_json = response.json()
#         status = rsp_json.get("status", "").lower()
#         data = rsp_json.get("data", None)
#         if data is not None or "fail" in status:
#             return rsp_json

#         time.sleep(0.5)

#     return False

# taskid = response.json().get("task_id")
# _ = check_if_task(taskid, 10)
