import pytest

from stormpiper.src import tasks

from .. import utils as test_utils


@pytest.mark.parametrize(
    "create_blob, patch_blob, exp_attrs",
    [
        (
            {"name": "empty scenario"},
            {"name": "empty scenario patched"},
            {"name": "empty scenario patched"},
        ),
        (
            {"name": "tmnt only scenario"},
            {
                "input": {
                    "tmnt_facility_collection": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {
                                    "node_id": "bmp-01",
                                    "facility_type": "bioretention_with_partial_infiltration_simple",
                                    "captured_pct": 80,
                                    "retained_pct": 20,
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [-122.473, 47.255],
                                },
                            }
                        ],
                    }
                }
            },
            {"structural_tmnt": [{"node_id": "bmp-01", "captured_pct": 80}]},
        ),
        (
            {"name": "tmnt only scenario - cost"},
            {
                "input": {
                    "tmnt_facility_collection": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {
                                    "node_id": "bmp-01",
                                    "facility_type": "bioretention_with_partial_infiltration_simple",
                                    "captured_pct": 80,
                                    "retained_pct": 20,
                                    "capital_cost": 450000,
                                    "om_cost_per_yr": 6000,
                                    "replacement_cost": 225000,
                                    "lifespan_yrs": 15,
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [-122.473, 47.255],
                                },
                            }
                        ],
                    }
                }
            },
            {
                "structural_tmnt": [
                    {"node_id": "bmp-01", "net_present_value": -739400.67}
                ]
            },
        ),
        (
            {"name": "tmnt scenario"},
            {
                "input": {
                    "delineation_collection": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {"name": "delin-01", "relid": "bmp-01"},
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [-122.473, 47.25],
                                            [-122.466, 47.25],
                                            [-122.466, 47.255],
                                            [-122.473, 47.255],
                                            [-122.473, 47.25],
                                        ]
                                    ],
                                },
                            },
                            {
                                "type": "Feature",
                                "properties": {"name": "delin-02", "relid": "bmp-01"},
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [-122.473, 47.25],
                                            [-122.466, 47.25],
                                            [-122.466, 47.255],
                                            [-122.473, 47.255],
                                            [-122.473, 47.25],
                                        ]
                                    ],
                                },
                            },
                        ],
                    },
                    "tmnt_facility_collection": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {
                                    "node_id": "bmp-01",
                                    "facility_type": "bioretention_with_partial_infiltration_simple",
                                    "captured_pct": 80,
                                    "retained_pct": 20,
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [-122.473, 47.255],
                                },
                            }
                        ],
                    },
                },
            },
            {
                "name": "tmnt scenario",
                "lgu_load": None,
                "lgu_boundary": None,
                "delin_load": None,
                "structural_tmnt": [{"node_id": "bmp-01", "captured_pct": 80}],
                "graph_edge": None,
                "structural_tmnt_result": None,
            },
        ),
    ],
)
def test_scenario_crud(client, create_blob, patch_blob, exp_attrs):
    route = "/api/rest/scenario"
    cresponse = client.post(route, json=create_blob)

    id_ = cresponse.json()["id"]
    route_id = route + f"/{id_}"

    presponse = client.patch(route_id, json=patch_blob)

    gresponse = client.get(route_id)

    ## cleanup
    dresponse = client.delete(route_id)

    for r in [cresponse, gresponse, presponse, dresponse]:
        assert r.status_code < 400, (r.content,)

    gjson = gresponse.json()
    for k, v in exp_attrs.items():
        res = gjson.get(k)
        if k == "structural_tmnt":
            for dct in v:
                node_id = dct["node_id"]
                gdct = [d for d in res if d.get("node_id") == node_id].pop()
                for stk, stv in dct.items():
                    gv = gdct.get(stk)
                    assert gv == stv, (gv, stv, gdct)
        else:
            assert res == v, (res, v, gjson)


def test_scenario_solve_data_wq(client):
    response = client.get("/api/rest/scenario")
    scenario = [
        dct
        for dct in response.json()
        if dct["id"] == "00000000-0000-4000-8000-000000000002"
    ][0]
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
        else:
            response = client.get(f"/api/rest/tasks/{task_id}")

            raise ValueError(
                f"Task timed out or failed for scenario {scenario['name']}. {response.content}"
            )
