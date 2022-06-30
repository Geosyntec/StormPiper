import sqlalchemy as sa
from geoalchemy2 import Geometry
from sqlalchemy import Column, Float, Integer, String

from stormpiper.connections import arcgis
from stormpiper.core.config import settings

from ..hacks import view
from .base_class import Base, TrackedTable

__all__ = ["TMNTFacilityDelineation", "TMNTFacility", "TMNTFacilityAttr", "TMNT_View"]


def delin_node_id(context):
    relid = context.get_current_parameters()["relid"]
    altid = context.get_current_parameters()["altid"]
    return arcgis.delineation_node_id(relid, altid)


class TMNTFacilityDelineation(Base, TrackedTable):

    __tablename__ = "tmnt_facility_delineation"

    id = Column(Integer, primary_key=True)
    altid = Column(String)
    relid = Column(String)
    node_id = Column(String, default=delin_node_id, onupdate=delin_node_id)
    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


def facility_node_id(context):
    altid = context.get_current_parameters()["altid"]
    return arcgis.facility_node_id(altid)


class TMNTFacility(Base, TrackedTable):
    """This table comes directly from the Tacoma GIS team.

    The node_id column is computed at the time of insertion.
    """

    __tablename__ = "tmnt_facility"

    id = Column(Integer, primary_key=True)
    altid = Column(String, unique=True)
    node_id = Column(String, default=facility_node_id, onupdate=facility_node_id)
    commonname = Column(String)
    facilitytype = Column(String)
    facilitydetail = Column(String)
    flowcontrol = Column(String)
    infiltrated = Column(String)
    waterquality = Column(String)
    flowcontroltype = Column(String)
    waterqualitytype = Column(String)

    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


class TMNTFacilityAttr(Base, TrackedTable):

    __tablename__ = "tmnt_facility_attributes"

    id = Column(Integer, primary_key=True)
    altid = Column(String, unique=True)

    # modeling attrs
    treatment_strategy = Column(String)
    facility_type = Column(String)
    ref_data_key = Column(String)
    hsg = Column(String)
    design_storm_depth_inches = Column(Float)
    tributary_area_tc_min = Column(Float)
    total_volume_cuft = Column(Float)
    area_sqft = Column(Float)
    inf_rate_inhr = Column(Float)
    retention_volume_cuft = Column(Float)
    media_filtration_rate_inhr = Column(Float)
    minimum_retention_pct_override = Column(Float)
    treatment_rate_cfs = Column(Float)
    depth_ft = Column(Float)

    # simplified attrs
    captured_pct = Column(Float)
    retained_pct = Column(Float)


tmnt = sa.Table("tmnt_facility", Base.metadata)
tmnt_attrs = sa.Table("tmnt_facility_attributes", Base.metadata)


class TMNT_View(Base):
    __table__ = view(
        "tmnt_v",
        Base.metadata,
        sa.select(
            tmnt.c.id,
            tmnt.c.node_id,
            tmnt.c.altid,
            tmnt.c.facilitytype,
            tmnt.c.commonname,
            tmnt.c.facilitydetail,
            tmnt.c.flowcontrol,
            tmnt.c.infiltrated,
            tmnt.c.waterquality,
            tmnt.c.flowcontroltype,
            tmnt.c.waterqualitytype,
            tmnt_attrs.c.treatment_strategy,
            tmnt_attrs.c.facility_type,
            tmnt_attrs.c.ref_data_key,
            tmnt_attrs.c.design_storm_depth_inches,
            tmnt_attrs.c.tributary_area_tc_min,
            tmnt_attrs.c.total_volume_cuft,
            tmnt_attrs.c.area_sqft,
            tmnt_attrs.c.inf_rate_inhr,
            tmnt_attrs.c.retention_volume_cuft,
            tmnt_attrs.c.media_filtration_rate_inhr,
            tmnt_attrs.c.hsg,
            tmnt_attrs.c.minimum_retention_pct_override,
            tmnt_attrs.c.treatment_rate_cfs,
            tmnt_attrs.c.depth_ft,
            tmnt_attrs.c.captured_pct,
            tmnt_attrs.c.retained_pct,
            tmnt.c.geom,
        ).select_from(tmnt.join(tmnt_attrs, tmnt.c.altid == tmnt_attrs.c.altid)),
    )
