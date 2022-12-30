from geoalchemy2 import Geometry
from sqlalchemy import Column, Float, Integer, String, Table

from stormpiper.core.config import settings

from .base_class import Base


class Subbasin(Base):
    """This table comes directly from the Tacoma GIS team.

    The node_id column is computed at the time of insertion.
    """

    __tablename__ = "subbasin"

    id = Column(Integer, primary_key=True)
    basinname = Column(String)
    subbasin = Column(String)
    area_acres = Column(Float)
    access = Column(Float)
    economic_value = Column(Float)
    environmental_value = Column(Float)
    livability_value = Column(Float)
    opportunity_value = Column(Float)

    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


_result_cols = [
    "runoff_volume_cuft",
    "TCu_load_lbs",
    "TN_load_lbs",
    "TP_load_lbs",
    "TSS_load_lbs",
    "TZn_load_lbs",
    "PHE_load_lbs",
    "PYR_load_lbs",
    "DEHP_load_lbs",
]


class SubbasinResult(Base):
    __table__ = Table(
        "subbasin_result",
        Base.metadata,
        *[
            Column("id", Integer, primary_key=True),
            Column("subbasin", String),
            Column("node_id", String),
            Column("epoch", String),
        ],
        *[Column(n, Float) for n in _result_cols],
    )
