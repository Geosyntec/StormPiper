from typing import Optional

from .base import BaseModel


# Shared properties
class TMNTFacilityAttrBase(BaseModel):

    # modeling attrs
    treatment_strategy: Optional[str] = None
    facility_type: Optional[str] = None
    # ref_data_key: Optional[str] = None
    hsg: Optional[str] = None
    design_storm_depth_inches: Optional[float] = None
    tributary_area_tc_min: Optional[float] = None
    total_volume_cuft: Optional[float] = None
    area_sqft: Optional[float] = None
    inf_rate_inhr: Optional[float] = None
    retention_volume_cuft: Optional[float] = None
    media_filtration_rate_inhr: Optional[float] = None
    minimum_retention_pct_override: Optional[float] = None
    treatment_rate_cfs: Optional[float] = None
    depth_ft: Optional[float] = None

    # simplified attrs
    captured_pct: Optional[float] = None
    retained_pct: Optional[float] = None


# Properties to receive on creation
class TMNTFacilityAttrCreate(TMNTFacilityAttrBase):
    altid: str


# Properties to receive on update
class TMNTFacilityAttrPatch(TMNTFacilityAttrBase):
    pass


# Properties to send on update
class TMNTFacilityAttrUpdate(TMNTFacilityAttrPatch):
    updated_by: Optional[str] = None


# Properties shared by models stored in DB
class TMNTFacilityAttrInDBBase(TMNTFacilityAttrBase):
    altid: str

    basinname: Optional[str] = None
    subbasin: Optional[str] = None

    class Config:
        orm_mode = True


# Properties to return to client
class TMNTFacilityAttr(TMNTFacilityAttrInDBBase):
    pass


# Properties properties stored in DB
class TMNTFacilityAttrInDB(TMNTFacilityAttrInDBBase):
    pass
