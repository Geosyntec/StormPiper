import pytest

from stormpiper.models.scenario import (
    DELIN_ONLY_SCENARIO,
    TMNT_ONLY_SCENARIO,
    TMNT_SCENARIO,
    TMNT_SCENARIO_NO_COST,
)
from stormpiper.src import tasks

from .. import utils as test_utils


@pytest.mark.integration
@test_utils.with_ee_login
def test_scenario_solve_data(client):
    response = client.get("/api/rest/scenario")
    for scenario in response.json()[:3]:
        scenario["updated_by"] = "test"
        updated_scenario = tasks.update_scenario_results(scenario, force=True)

        assert updated_scenario.get("updated_by", "") == "test"

    # just check that this runs for now...


@pytest.mark.integration
@test_utils.with_ee_login
def test_scenario_solve(client):
    response = client.get("/api/rest/scenario")

    scenarios = [
        {"name": dct["name"], "input": dct.get("input", None)}
        for dct in response.json()
    ][:3]

    for scenario in scenarios:
        response = client.post(f"/api/rpc/solve_scenario", json=scenario)
        task_id = response.json()["task_id"]

        task_response = test_utils.poll_testclient_url(
            client, f"/api/rest/tasks/{task_id}", timeout=60
        )

        if task_response:
            rjson = task_response.json()
            assert rjson.get("status", "").lower() == "success"
        else:  # pragma: no cover ; help with test debugging
            response = client.get(f"/api/rest/tasks/{task_id}")

            raise ValueError(
                f"Task timed out or failed for scenario {scenario['name']}. {response.content}"
            )


@pytest.mark.integration
@test_utils.with_ee_login
def test_scenario_solve_data_wq(client):
    response = client.get("/api/rest/scenario")
    scenario = [dct for dct in response.json() if dct["name"] == "tmnt scenario"][0]
    scenario["input"]["tmnt_facility_collection"]["features"][0]["properties"][
        "captured_pct"
    ] = 81

    updated_scenario = tasks.update_scenario_results(scenario, force=True)
    assert (
        updated_scenario["input"]["tmnt_facility_collection"]["features"][0][
            "properties"
        ]["captured_pct"]
        == 81
    ), updated_scenario

    assert updated_scenario["structural_tmnt_result"] != None, updated_scenario


@pytest.mark.integration
@test_utils.with_ee_login
@pytest.mark.parametrize(
    "blob",
    [
        DELIN_ONLY_SCENARIO,
        TMNT_ONLY_SCENARIO,
        TMNT_SCENARIO,
        TMNT_SCENARIO_NO_COST,
    ],
)
def test_solve_new_scenario(client, blob):
    route = "/api/rest/scenario"
    cresponse = client.post(route, json=blob)
    scenario = cresponse.json()

    scenario_id = scenario["id"]
    route_id = route + f"/{scenario_id}"

    try:
        response = client.post(f"/api/rpc/solve_scenario/{scenario_id}")
        task_id = response.json()["task_id"]

        task_response = test_utils.poll_testclient_url(
            client, f"/api/rest/tasks/{task_id}", timeout=120
        )

        if task_response:
            rjson = task_response.json()
            assert rjson.get("status", "").lower() == "success"
        else:  # pragma: no cover
            response = client.get(f"/api/rest/tasks/{task_id}")

            raise ValueError(
                f"Task timed out or failed for scenario {scenario['name']}. {response.content}"
            )
    finally:
        ## cleanup
        _ = client.delete(route_id)


@pytest.mark.integration
@test_utils.with_ee_login
@pytest.mark.parametrize(
    "blob",
    [
        DELIN_ONLY_SCENARIO,
        TMNT_ONLY_SCENARIO,
        TMNT_SCENARIO,
        TMNT_SCENARIO_NO_COST,
    ],
)
def test_solve_scenario_foreground(admin_client, blob):
    response = admin_client.post("/api/rpc/solve_scenario_foreground", json=blob)
    assert response.status_code < 300, response.content
