# Parameter Dictionary

[altid](#altid)


## Treatment Facility Input Parameters
  
<div id="facility_type"></div>
Facility Type
  ~ TODO

## Result Parmeters 

<div id="altid"></div>

altid
  ~ TODO

<div id="area_sqft"></div>

area_sqft
  ~ TODO

<div id="captured_pct"></div>

captured_pct
  ~ TODO

<div id="commonname"></div>

commonname
  ~ TODO

<div id="depth_ft"></div>

depth_ft 
  ~ TODO

<div id="design_storm_depth_inches"></div>

design_storm_depth_inches 
  ~ TODO

<div id="facility_type"></div>

facility_type 
  ~ TODO

<div id="facilitydetail"></div>

facilitydetail  
  ~ TODO

<div id="facilitytype"></div>

facilitytype 
  ~ TODO

<div id="flowcontrol"></div>

flowcontrol 
  ~ TODO

<div id="flowcontroltype"></div>

flowcontroltype 
  ~ TODO

<div id="hsg"></div>

hsg 
  ~ TODO

<div id="inf_rate_inhr"></div>

inf_rate_inhr 
  ~ TODO

<div id="infiltrated"></div>

infiltrated 
  ~ TODO

<div id="media_filtration_rate_inhr"></div>

media_filtration_rate_inhr 
  ~ TODO

<div id="minimum_retention_pct_override"></div>

minimum_retention_pct_override 
  ~ TODO

<div id="node_id"></div>

node_id 
  ~ TODO

<div id="retained_pct"></div>

retained_pct 
  ~ TODO

<div id="retention_volume_cuft"></div>

retention_volume_cuft 
  ~ TODO

<div id="total_volume_cuft"></div>

total_volume_cuft 
  ~ TODO

<div id="treatment_rate_cfs"></div>

treatment_rate_cfs 
  ~ TODO

<div id


waterqualitytype  | |

Table: Treatment Facility Parameters

<!-- cost data -->
| Parameter                    | Description |
| ---------------------------- | ----------- |
| capital_cost                 | None        |
| capital_cost_basis_year: int | None        |
| om_cost_per_yr: float        | None        |
| om_cost_basis_year: int      | float       | None |
| install_year: int            | float       | None |
| replacement_cost: float      | None        |
| lifespan_yrs: float          | int         | None |


# Cost Analysis Parameters 
<div id="cost_analysis_params">

## Global Parameters 
    
    discount_rate: float | None = None
    inflation_rate: float | None = None
    planning_horizon_yrs: float | int | None = None
    cost_basis_year: float | int | None = None

## Input Parameters 




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

<!-- Results -->
    "node_id",
    "epoch",
    "node_type",
    "ntype",
    "facility_type",
    "valid_model",
    "subbasin",
    "basinname",

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

    # simplified attrs
    captured_pct: None | float = None
    retained_pct: None | float = None



captured_pct 1
  ~ Definition 1

retained_pct
  ~ Percentage retained *(cu/ft)*


