import json

import pytest

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
                    {"node_id": "bmp-01", "present_value_total_cost": 1500255.0}
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
        assert r.status_code < 400, r.content

    gjson = gresponse.json()
    for k, v in exp_attrs.items():
        res = gjson.get(k)
        if k == "structural_tmnt":
            for dct in v:
                node_id = dct["node_id"]
                gdct = [d for d in res if d.get("node_id") == node_id].pop()
                for stk, stv in dct.items():
                    gv = gdct.get(stk)
                    if isinstance(stv, (float)):
                        assert abs((stv - gv) / stv) < 0.01, (gv, stv, gdct)
                    else:
                        assert gv == stv, (gv, stv, gdct)
        else:
            assert res == v, (res, v, gjson)


@pytest.mark.parametrize(
    "id_, field, rsp_status, rsp_data",
    [
        ("00000000-0000-4000-8000-000000000001", "name", 200, "delin only"),
        ("00b77cfe-228e-4cb5-b4bb-b2bc18976a2e", "name", 404, None),  # no id
        ("00000000-0000-4000-8000-000000000001", "bad", 404, None),  # no field
    ],
)
def test_scenario_details(client, id_, field, rsp_status, rsp_data):
    route = f"/api/rest/scenario/{id_}/{field}"
    response = client.get(route)

    assert response.status_code == rsp_status, response.content
    if rsp_data:
        assert response.json() == rsp_data, response.content


@pytest.mark.parametrize(
    "blob, exp_pv",
    [
        (
            {
                "name": "tmnt scenario no costs",
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
                            },
                        ],
                    },
                },
            },
            False,
        ),
        (
            {
                "name": "tmnt scenario with costs",
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
                                    "capital_cost": 250000,
                                    "om_cost_per_yr": 6000,
                                    "lifespan_yrs": 30,
                                    "replacement_cost": 180000,
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [-122.473, 47.255],
                                },
                            },
                        ],
                    },
                },
            },
            True,
        ),
    ],
)
def test_tmnt_only_scenario(client, blob, exp_pv):
    route = "/api/rest/scenario"
    cresponse = client.post(route, json=blob)

    id_ = cresponse.json()["id"]
    route_id = route + f"/{id_}"

    gresponse = client.get(route_id)

    ## cleanup
    dresponse = client.delete(route_id)

    scenario_data = gresponse.json()

    structural_tmnt = scenario_data.get("structural_tmnt", None)
    assert structural_tmnt is not None, scenario_data
    assert len(structural_tmnt) == 1, structural_tmnt
    tmnt_table = structural_tmnt[0]

    pv = tmnt_table.get("present_value_total_cost", None)
    if exp_pv:
        assert pv is not None, tmnt_table
        assert isinstance(pv, (int, float)), tmnt_table
    else:
        assert pv is None, tmnt_table


@pytest.mark.parametrize(
    "blob",
    [
        (
            {
                "name": "tmnt scenario with costs",
                "input": {
                    "delineation_collection": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {"name": "delin-01"},
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [-122.473, 47.250],
                                            [-122.466, 47.250],
                                            [-122.466, 47.255],
                                            [-122.473, 47.255],
                                            [-122.473, 47.250],
                                        ]
                                    ],
                                },
                            }
                        ],
                    }
                },
            }
        )
    ],
)
def test_delin_only_scenario(client, blob):
    route = "/api/rest/scenario"
    cresponse = client.post(route, json=blob)

    id_ = cresponse.json()["id"]
    route_id = route + f"/{id_}"

    gresponse = client.get(route_id)

    ## cleanup
    dresponse = client.delete(route_id)

    scenario_data = gresponse.json()

    delineation_collection = scenario_data.get("input", {}).get(
        "delineation_collection", None
    )
    scenario_data_dump = json.dumps(scenario_data, indent=2)
    assert delineation_collection is not None, scenario_data_dump

    features = delineation_collection.get("features", [])
    assert len(features) > 0, scenario_data_dump

    delin = features[0]
    properties = delin.get("properties", {})
    assert properties, scenario_data_dump
    assert properties.get("node_id", None) is not None
    assert properties.get("altid", None) is not None


def test_scenario_solve_id(client):
    response = client.get("/api/rest/scenario")

    ids = [
        "00000000-0000-4000-8000-000000000000",
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000002",
    ]

    scenarios = [dct for dct in response.json() if dct["id"] in ids]

    for scenario in scenarios:
        scenario_id = scenario["id"]
        response = client.post(f"/api/rpc/solve_scenario/{scenario_id}")
        task_id = response.json()["task_id"]

        task_response = test_utils.poll_testclient_url(
            client, f"/api/rest/tasks/{task_id}", timeout=60
        )

        if task_response:
            rjson = task_response.json()
            assert rjson.get("status", "").lower() == "success"
        else:  # pragma: no cover
            response = client.get(f"/api/rest/tasks/{task_id}")

            raise ValueError(
                f"Task timed out or failed for scenario {scenario['name']}. {response.content}"
            )
