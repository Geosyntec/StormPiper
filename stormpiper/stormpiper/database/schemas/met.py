from sqlalchemy import Column, Float, Integer, String

from .base_class import Base


class Met(Base):
    """This table comes from"""

    __tablename__ = "met"

    id = Column(Integer, primary_key=True)
    epoch = Column(String)
    mean_annual_precip_depth_inches = Column(Float)
    design_storm_precip_depth_inches = Column(Float)  # 91st percentile 24 hr storm
