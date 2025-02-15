from copy import deepcopy

import pytest

from stormpiper.models.scenario_validator import scenario_validator
from stormpiper.src import scenario
from stormpiper.tests.utils import tacoma_scenarios

SCENARIOS = tacoma_scenarios()

TMNT_SCENARIO = [dct for dct in SCENARIOS if dct["name"] == "tmnt scenario"].pop()
MOD_TMNT = deepcopy(TMNT_SCENARIO)
MOD_TMNT["input"]["tmnt_facility_collection"]["features"][0]["properties"][
    "captured_pct"
] = 81


@pytest.mark.parametrize(
    "data, exp",
    [
        (
            {"name": "empty scenario"},
            {"name": "empty scenario"},
        ),
        (
            MOD_TMNT,
            {"name": "tmnt scenario"},
        ),
    ],
)
def test_scenario_solve_scenario_data(data, exp):
    valid_model = scenario_validator(scenario=data)
    updated_scenario = scenario.solve_scenario_data(data=valid_model.dict())
    for k, v in exp.items():
        assert updated_scenario[k] == v, (k, v, updated_scenario[k])
