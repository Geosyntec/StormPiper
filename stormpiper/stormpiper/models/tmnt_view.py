from .base import BaseORM


class TMNTView(BaseORM):
    node_id: str
    altid: str
    facilitytype: str | None
    commonname: str | None
    facilitydetail: str | None
    flowcontrol: str | None
    infiltrated: str | None
    waterquality: str | None
    flowcontroltype: str | None
    waterqualitytype: str | None
    facility_type: str | None
    design_storm_depth_inches: float | None
    tributary_area_tc_min: float | None
    total_volume_cuft: float | None
    area_sqft: float | None
    inf_rate_inhr: float | None
    retention_volume_cuft: float | None
    media_filtration_rate_inhr: float | None
    hsg: str | None
    minimum_retention_pct_override: float | None
    treatment_rate_cfs: float | None
    depth_ft: float | None
    captured_pct: float | None
    retained_pct: float | None

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

    # cost effectiveness
    TCu_total_cost_dollars_per_load_lbs_removed: float | None
    TN_total_cost_dollars_per_load_lbs_removed: float | None
    TP_total_cost_dollars_per_load_lbs_removed: float | None
    TSS_total_cost_dollars_per_load_lbs_removed: float | None
    TZn_total_cost_dollars_per_load_lbs_removed: float | None
    PHE_total_cost_dollars_per_load_lbs_removed: float | None
    PYR_total_cost_dollars_per_load_lbs_removed: float | None
    DEHP_total_cost_dollars_per_load_lbs_removed: float | None

    class Config:
        orm_mode = True
