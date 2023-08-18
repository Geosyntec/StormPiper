import logging

from stormpiper.core.config import settings

from .base import BaseModel, BaseORM

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


# Shared properties
class TMNTFacilityAttrBase(BaseModel):
    # modeling attrs
    facility_type: None | str = None
    hsg: None | str = None
    design_storm_depth_inches: None | float = None
    tributary_area_tc_min: None | float = None
    total_volume_cuft: None | float = None
    area_sqft: None | float = None
    inf_rate_inhr: None | float = None
    retention_volume_cuft: None | float = None
    media_filtration_rate_inhr: None | float = None
    minimum_retention_pct_override: None | float = None
    treatment_rate_cfs: None | float = None
    depth_ft: None | float = None
    treatment_drawdown_time_hr: None | float = None

    # simplified attrs
    captured_pct: None | float = None
    retained_pct: None | float = None


# Properties to receive on update
class TMNTFacilityAttrPatch(TMNTFacilityAttrBase):
    ...


# Properties to send on update
class TMNTFacilityAttrUpdate(TMNTFacilityAttrPatch):
    updated_by: None | str


# Properties to receive on creation
class TMNTFacilityAttrCreate(TMNTFacilityAttrUpdate):
    ...


# Properties shared by models stored in DB
class TMNTFacilityAttrInDBBase(BaseORM, TMNTFacilityAttrBase):
    altid: str
    node_id: str
    basinname: None | str
    subbasin: None | str


# Properties to return to client
class TMNTFacilityAttr(TMNTFacilityAttrInDBBase):
    ...


# Properties properties stored in DB
class TMNTFacilityAttrInDB(TMNTFacilityAttrInDBBase):
    ...


# TMNT Cost related attributes


# Shared properties
class TMNTFacilityCostBase(BaseModel):
    # cost attrs
    capital_cost: float | None = None
    capital_cost_basis_year: int | float | None = None
    om_cost_per_yr: float | None = None
    om_cost_basis_year: int | float | None = None
    install_year: int | float | None = None
    replacement_cost: None | float = None
    lifespan_yrs: float | int | None = None


# Properties to receive on update
class TMNTFacilityCostPatch(TMNTFacilityCostBase):
    ...


# Properties to send to DB on update
class TMNTFacilityCostUpdate(TMNTFacilityCostPatch):
    updated_by: None | str = None

    # globals
    discount_rate: float | None = None
    inflation_rate: float | None = None
    planning_horizon_yrs: float | int | None = None
    cost_basis_year: float | int | None = None

    # cost results
    present_value_capital_cost: float | None = None
    present_value_om_cost: float | None = None
    present_value_total_cost: float | None = None
    present_value_cost_table: list[dict] | None = None
    present_value_chart_table: list[dict] | None = None


# Properties to receive on creation
class TMNTFacilityCostCreate(TMNTFacilityCostUpdate):
    node_id: str


# Properties shared by models stored in DB
class TMNTFacilityCostInDBBase(BaseORM, TMNTFacilityCostBase):
    node_id: str

    # globals
    discount_rate: float | None = None
    inflation_rate: float | None = None
    planning_horizon_yrs: float | int | None = None
    cost_basis_year: float | int | None = None

    # cost results
    present_value_capital_cost: float | None = None
    present_value_om_cost: float | None = None
    present_value_total_cost: float | None = None
    present_value_cost_table: list[dict] | None = None
    present_value_chart_table: list[dict] | None = None


# Properties to return to client
class TMNTFacilityCost(TMNTFacilityCostInDBBase):
    ...


class TMNTUpdate(BaseModel):
    tmnt_attr: None | TMNTFacilityAttrUpdate = None
    tmnt_cost: None | TMNTFacilityCostUpdate = None


class TMNTFacilityPatch(TMNTFacilityCostPatch, TMNTFacilityAttrPatch):
    ...


class InvalidModel(Exception):
    ...
