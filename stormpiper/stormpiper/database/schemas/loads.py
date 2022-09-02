from geoalchemy2 import Geometry
from sqlalchemy import Column, Float, Integer, String

from stormpiper.core.config import settings

from .base_class import Base

__all__ = ["LGUBoundary", "LGULoad", "LGULoadToStructural", "LoadToDownStreamSrcCtrl"]


class LGUBoundary(Base):

    __tablename__ = "lgu_boundary"

    id = Column(Integer, primary_key=True)
    altid = Column(String)
    relid = Column(String)
    node_id = Column(String)
    subbasin = Column(String)
    basinname = Column(String)
    geom = Column(Geometry(srid=settings.TACOMA_EPSG))


class LGULoadBase:
    id = Column(Integer, primary_key=True)
    node_id = Column(String)
    epoch = Column(String)
    variable = Column(String)
    value = Column(Float)
    units = Column(String)


class LGULoad(Base, LGULoadBase):
    """This table is computed by an earth engine zonal stats operation
    that uses the lgu_bounds features.
    This load may be reduced by 'upstream' source controls.
    """

    __tablename__ = "lgu_load"


class LGULoadToStructural(Base, LGULoadBase):
    """This table is computed by reducing the lgu_load table by the mass reduced by
    source controls upstream of structural treatment controls.
    This load may be reduced by structural treatment controls.
    """

    __tablename__ = "lgu_load_to_structural"


class LoadToDownStreamSrcCtrl(Base, LGULoadBase):
    """This table is computed by summarizing the results of structural treatment
    at each subbasin. Downstream src controls are allowed at the subbasin level only,
    so this table includes the total pollutant load discharged by subbasin nodes
    of the structural treatment 'graph'.
    This load may be reduced by 'downstream' source controls.
    """

    __tablename__ = "load_to_ds_src_ctrl"
