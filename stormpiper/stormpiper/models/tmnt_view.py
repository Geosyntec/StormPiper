from typing import Optional

from stormpiper.models.base import BaseModel



class TMNTView(BaseModel):
    # id:str
    node_id: str
    altid: str
    facilitytype: str
    # treatment_strategy: Optional[str]
    facility_type: Optional[str]
    # ref_data_key:Optional[str]
    design_storm_depth_inches: Optional[float]
    tributary_area_tc_min: Optional[float]
    total_volume_cuft: Optional[float]
    area_sqft: Optional[float]
    inf_rate_inhr: Optional[float]
    retention_volume_cuft: Optional[float]
    media_filtration_rate_inhr: Optional[float]
    hsg: Optional[str]
    minimum_retention_pct_override: Optional[float]
    treatment_rate_cfs: Optional[float]
    depth_ft: Optional[float]
    captured_pct: Optional[float]
    retained_pct: Optional[float]

    class Config:
        orm_mode = True
