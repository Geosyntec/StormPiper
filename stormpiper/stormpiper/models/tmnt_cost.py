from .base import BaseModel, BaseORM

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
    lifespan_yrs: float | int
    replacement_cost: None | float = None
    discount_rate: float
    planning_horizon_yrs: float | int

    class Config:
        schema_extra = {"example": EXAMPLE_NPV}


# Shared properties
class TMNTFacilityCostBase(BaseModel):

    # cost attrs
    capital_cost: None | float = None
    om_cost_per_yr: None | float = None
    lifespan_yrs: None | float = None
    replacement_cost: None | float = None


# Properties to receive on creation
class TMNTFacilityCostCreate(TMNTFacilityCostBase):
    node_id: str


# Properties to receive on update
class TMNTFacilityCostPatch(TMNTFacilityCostBase):
    ...


# Properties to send to DB on update
class TMNTFacilityCostUpdate(TMNTFacilityCostPatch):
    updated_by: None | str = None
    net_present_value: None | float = None


# Properties shared by models stored in DB
class TMNTFacilityCostInDBBase(BaseORM, TMNTFacilityCostBase):
    node_id: str
    net_present_value: None | float = None


# Properties to return to client
class TMNTFacilityCost(TMNTFacilityCostInDBBase):
    ...
