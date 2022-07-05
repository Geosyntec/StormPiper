from geoalchemy2 import Geometry
from sqlalchemy import Column, Float, Integer, String

from stormpiper.core.config import settings

from .base_class import Base

__all__ = ["LGUBoundary", "LGULoad"]


class LGUBoundary(Base):

    __tablename__ = "lgu_boundary"

    id = Column(Integer, primary_key=True)
    altid = Column(String)
    relid = Column(String)
    node_id = Column(String)
    subbasin = Column(String)
    basinname = Column(String)
    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


class LGULoad(Base):
    """This table is computed by an earth engine zonal stats operation
    that uses the lgu_bounds features
    """

    __tablename__ = "lgu_load"

    id = Column(Integer, primary_key=True)
    node_id = Column(String)
    epoch = Column(String)
    variable = Column(String)
    value = Column(Float)
