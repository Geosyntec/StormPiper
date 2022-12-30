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
