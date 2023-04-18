from sqlalchemy import Column, Float, String

from .base_class import Base, MutableTrackedTable


class TMNTFacilityCost(Base, MutableTrackedTable):
    __tablename__ = "tmnt_facility_cost"

    node_id = Column(String, primary_key=True)

    # cost attrs
    capital_cost = Column(Float)
    om_cost_per_yr = Column(Float)
    lifespan_yrs = Column(Float)
    replacement_cost = Column(Float)
    net_present_value = Column(Float)
