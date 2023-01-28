import pytest

from stormpiper.src import npv


@pytest.mark.parametrize(
    "inp, exp",
    [
        (
            {
                "planning_horizon_yrs": 50,
                "discount_rate": 0.05,
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
            },
            -739400.67,
        )
    ],
)
def test_compute_bmp_npv(inp, exp):
    res, *_ = npv.compute_bmp_npv(**inp)

    assert (abs(exp - res) / exp) < 0.01, (inp, res, exp)
