import pytest

from stormpiper.src import npv


@pytest.mark.parametrize(
    "inp, exp",
    [
        (
            {
                "planning_horizon_yrs": 50,
                "discount_rate": 0.05,
                "inflation_rate": 0.022,
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
                "cost_basis_year": 2023,
            },
            1296592,
        ),
        (
            {
                "planning_horizon_yrs": 50,
                "discount_rate": 0.05,
                "inflation_rate": 0.0,
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
                "cost_basis_year": 2023,
            },
            750866,
        ),
        (
            {
                "planning_horizon_yrs": 50,
                "discount_rate": 0.0,
                "inflation_rate": 0.022,
                "capital_cost": 450000,
                "om_cost_per_yr": 6000,
                "replacement_cost": 225000,
                "lifespan_yrs": 15,
                "cost_basis_year": 2023,
            },
            4414133,
        ),
        (
            {
                "planning_horizon_yrs": 30,
                "discount_rate": 0.042,
                "inflation_rate": 0.022,
                "capital_cost": 59000,
                "om_cost_per_yr": 2800,
                "replacement_cost": 14750,
                "lifespan_yrs": 11,
                "cost_basis_year": 2023,
                "install_year": 1990,
            },
            194411,
        ),
        (
            {
                "planning_horizon_yrs": 30,
                "discount_rate": 0.042,
                "inflation_rate": 0.022,
                "capital_cost": 42000,
                "om_cost_per_yr": 2800,
                "replacement_cost": 14750,
                "lifespan_yrs": 11,
                "capital_cost_basis_year": 1990,
                "cost_basis_year": 2023,
                "install_year": 1990,
            },
            222923,
        ),
        (
            {
                "planning_horizon_yrs": 30,
                "discount_rate": 0.042,
                "inflation_rate": 0.022,
                "capital_cost": 42000,
                "om_cost_per_yr": 1500,
                "replacement_cost": 14750,
                "lifespan_yrs": 11,
                "capital_cost_basis_year": 1990,
                "om_cost_basis_year": 1990,
                "cost_basis_year": 2023,
                "install_year": 1990,
            },
            279522,
        ),
        (
            {
                "planning_horizon_yrs": 30,
                "discount_rate": 0.042,
                "inflation_rate": 0.022,
                "capital_cost": 59000,
                "om_cost_per_yr": 2800,
                "replacement_cost": 14750,
                "lifespan_yrs": 11,
                "capital_cost_basis_year": 2023,
                "om_cost_basis_year": 2023,
                "cost_basis_year": 2023,
                "install_year": 2050,
            },
            148100,
        ),
    ],
)
def test_compute_bmp_pv(inp, exp):
    cost_result = npv.compute_bmp_pv(**inp)
    res = cost_result["present_value_total_cost"]

    assert abs(exp - res) < 1, (inp, res, exp)
