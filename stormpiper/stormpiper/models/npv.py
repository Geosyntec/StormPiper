from typing import Optional, Union

from .base import BaseModel


EXAMPLE_NPV = dict(
    planning_horizon_yrs=50,  # years
    discount_rate=0.05,  # avg interest rate 0.08 - 0.03 for inflation
    capital_cost=450_000,  # $
    om_cost_per_yr=6000,  # $
    replacement_cost=450_000 / 2,  # incurred at end of lifespan. refurbishment cost
    lifespan_yrs=15,
)


class NPVRequest(BaseModel):
    capital_cost: float
    om_cost_per_yr: float
    lifespan_yrs: Union[float, int]
    replacement_cost: Optional[float] = None
    discount_rate: float
    planning_horizon_yrs: Union[float, int]

    class Config:
        schema_extra = {"example": EXAMPLE_NPV}
