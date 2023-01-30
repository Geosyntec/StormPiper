from .base import BaseModel, BaseORM


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


# Properties to receive on creation
class TMNTFacilityAttrCreate(TMNTFacilityAttrBase):
    ...


# Properties to receive on update
class TMNTFacilityAttrPatch(TMNTFacilityAttrBase):
    ...


# Properties to send on update
class TMNTFacilityAttrUpdate(TMNTFacilityAttrPatch):
    updated_by: None | str


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
