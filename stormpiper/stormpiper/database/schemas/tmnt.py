from enum import Enum

import sqlalchemy as sa
from geoalchemy2 import Geometry
from sqlalchemy import Column, Float, Integer, String

from stormpiper.connections import arcgis
from stormpiper.core.config import settings

from .base_class import Base, MutableTrackedTable

__all__ = [
    "TMNTFacilityDelineation",
    "TMNTFacility",
    "TMNTFacilityAttr",
    "TMNTSourceControlUpstreamLoadReduced",
    "TMNTSourceControlDownstreamLoadReduced",
]


def delin_node_id(context):
    relid = context.get_current_parameters()["relid"]
    altid = context.get_current_parameters()["altid"]
    return arcgis.delineation_node_id(relid, altid)


class TMNTFacilityDelineation(Base):
    __tablename__ = "tmnt_facility_delineation"

    id = Column(Integer, primary_key=True)
    altid = Column(String)
    relid = Column(String)
    node_id = Column(String, default=delin_node_id, onupdate=delin_node_id)
    ds_node_id = Column(String)
    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


def facility_node_id(context):
    altid = context.get_current_parameters()["altid"]
    return arcgis.facility_node_id(altid)


class TMNTFacility(Base):
    """This table comes directly from the Tacoma GIS team.

    The node_id column is computed at the time of insertion.
    """

    __tablename__ = "tmnt_facility"

    id = Column(Integer, primary_key=True)
    altid = Column(String, unique=True)
    node_id = Column(
        String, unique=True, default=facility_node_id, onupdate=facility_node_id
    )
    commonname = Column(String)
    facilitytype = Column(String)
    facilitydetail = Column(String)
    flowcontrol = Column(String)
    infiltrated = Column(String)
    waterquality = Column(String)
    flowcontroltype = Column(String)
    waterqualitytype = Column(String)

    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


class TMNTFacilityAttr(Base, MutableTrackedTable):
    __tablename__ = "tmnt_facility_attribute"

    id = Column(Integer, primary_key=True)
    altid = Column(String, unique=True)
    node_id = Column(
        String, unique=True, default=facility_node_id, onupdate=facility_node_id
    )

    basinname = Column(String)
    subbasin = Column(String)

    # modeling attrs
    facility_type = Column(String)
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


class Direction(str, Enum):
    upstream = "Upstream"
    downstream = "Downstream"


class TMNTSourceControl(Base, MutableTrackedTable):
    """This table is user editable."""

    __tablename__ = "tmnt_source_control"

    id = Column(Integer, primary_key=True)
    subbasin = Column(String, nullable=False)
    variable = Column(String, nullable=False)
    # if multiple for same subbasin and variable, will be applied in order least to greatest
    # default is last.
    order = Column(Integer, default=1e6)
    activity = Column(String, nullable=False)
    direction = Column(sa.Enum(Direction), nullable=False)

    # must be float between 0.0 and 100.0
    percent_reduction = Column(Float, default=0.0)

    __table_args__ = (
        # allow one order per pollutant & subbasin combo
        sa.UniqueConstraint("direction", "subbasin", "variable", "order"),
        # allow one activity per subbasin
        sa.UniqueConstraint("direction", "subbasin", "variable", "activity"),
        sa.CheckConstraint("percent_reduction between 0.0 and 100.0"),
    )


class TMNTSourceControlResultsBase:
    id = Column(Integer, primary_key=True)
    node_id = Column(String, nullable=False)
    subbasin = Column(String, nullable=False)
    basinname = Column(String)
    variable = Column(String, nullable=False)
    # if multiple for same subbasin and variable, will be applied in order least to greatest
    # default is last.
    order = Column(Integer)
    activity = Column(String, nullable=False)
    direction = Column(
        sa.dialects.postgresql.ENUM(name="direction", create_type=False), nullable=False
    )

    epoch = Column(String)
    value = Column(Float)
    units = Column(String)

    # must be float between 0.0 and 100.0
    percent_reduction = Column(Float, default=0.0)
    value_remaining_prev = Column(Float)
    value_remaining = Column(Float)
    load_reduced = Column(Float, default=0.0)


class TMNTSourceControlUpstreamLoadReduced(Base, TMNTSourceControlResultsBase):
    __tablename__ = "tmnt_source_control_upstream_load_reduced"


class TMNTSourceControlDownstreamLoadReduced(Base, TMNTSourceControlResultsBase):
    __tablename__ = "tmnt_source_control_downstream_load_reduced"
