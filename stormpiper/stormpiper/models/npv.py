from stormpiper.models.base import BaseModel

EXAMPLE_PV = dict(
    capital_cost=450_000,  # $
    capital_cost_basis_year=2023,
    om_cost_per_yr=6000,  # $
    om_cost_basis_year=2023,
    install_year=2027,  # future project
    replacement_cost=450_000 / 2,  # incurred at end of lifespan. refurbishment cost
    lifespan_yrs=15,
    # globals
    discount_rate=0.042,  # https://www.whitehouse.gov/wp-content/uploads/2023/02/M-23-12-Appendix-C-Update_Discount-Rates.pdf
    inflation_rate=0.022,  # https://www.cbo.gov/publication/58957
    planning_horizon_yrs=50,
    cost_basis_year=2023,
)


class PVRequest(BaseModel):
    capital_cost: float
    capital_cost_basis_year: int | float | None = None
    om_cost_per_yr: float
    om_cost_basis_year: int | float | None
    install_year: int | float | None
    replacement_cost: None | float = None
    lifespan_yrs: float | int | None = None
    # globals
    discount_rate: float
    inflation_rate: float
    planning_horizon_yrs: float | int
    cost_basis_year: float | int

    class Config:
        schema_extra = {"example": EXAMPLE_PV}
