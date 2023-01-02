import pytest

from stormpiper.database.connection import engine
from stormpiper.src import tasks

from .. import utils as test_utils


@pytest.mark.parametrize("limit", [3, 5])
def test_get_all_results(client, limit):
    user_token = test_utils.user_token(client)
    response = client.get(
        f"/api/rest/results?limit={limit}",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
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
    user_token = test_utils.user_token(client)
    q = f"?epoch={epoch}" if epoch else ""
    response = client.get(
        f"/api/rest/results/{node_id}{q}",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )

    if not exists:
        assert response.status_code >= 400, response.content
    else:
        assert 200 <= response.status_code < 300, response.content
        rsp_json = response.json()
        exp_len = 1 if epoch != "all" and epoch else 4
        assert len(rsp_json) == exp_len
        assert all(
            i in dct.keys()
            for dct in rsp_json
            for i in ["node_id", "epoch", "facility_type"]
        )


def test_clean_dirty_clean(client):
    user_token = test_utils.user_token(client)

    tasks.delete_and_refresh_all_results_tables(engine=engine)

    # check if db is clean
    response = client.get(
        f"/api/rest/results/is_dirty",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    assert rsp_json["is_dirty"] == False, rsp_json

    # dirty the results by patching an attribute
    response = client.get(
        "/api/rest/tmnt_attr/SWFA-100018",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()

    blob = rsp_json
    blob["captured_pct"] = 55

    response = client.patch(
        "/api/rest/tmnt_attr/SWFA-100018",
        json=blob,
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()

    # check if dirty got set
    response = client.get(
        f"/api/rest/results/is_dirty",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
    assert 200 <= response.status_code < 300, response.content
    rsp_json = response.json()
    assert rsp_json["is_dirty"] == True, rsp_json

    tasks.delete_and_refresh_all_results_tables(engine=engine)

    # check if dirty got cleaned
    response = client.get(
        f"/api/rest/results/is_dirty",
        headers={"Authorization": f"Bearer {user_token['access_token']}"},
    )
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
