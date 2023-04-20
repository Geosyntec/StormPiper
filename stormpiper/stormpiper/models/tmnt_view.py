from .base import BaseORM


class TMNTView(BaseORM):
    node_id: str
    altid: str
    facilitytype: None | str
    commonname: None | str
    facilitydetail: None | str
    flowcontrol: None | str
    infiltrated: None | str
    waterquality: None | str
    flowcontroltype: None | str
    waterqualitytype: None | str
    facility_type: None | str
    design_storm_depth_inches: None | float
    tributary_area_tc_min: None | float
    total_volume_cuft: None | float
    area_sqft: None | float
    inf_rate_inhr: None | float
    retention_volume_cuft: None | float
    media_filtration_rate_inhr: None | float
    hsg: None | str
    minimum_retention_pct_override: None | float
    treatment_rate_cfs: None | float
    depth_ft: None | float
    captured_pct: None | float
    retained_pct: None | float

    # cost attrs
    capital_cost: float | None
    capital_cost_basis_year: int | float | None
    om_cost_per_yr: float | None
    om_cost_basis_year: int | float | None
    install_year: int | float | None
    replacement_cost: float | None
    lifespan_yrs: float | int | None

    # cost results
    present_value_capital_cost: float | None
    present_value_om_cost: float | None
    present_value_total_cost: float | None
    present_value_cost_table: list[dict] | None = None
    present_value_chart_table: list[dict] | None = None

    class Config:
        orm_mode = True
