from sqlalchemy import Column, Float, Integer, String
from sqlalchemy.dialects.postgresql import JSONB

from .base_class import Base, MutableTrackedTable


class TMNTFacilityCost(Base, MutableTrackedTable):
    __tablename__ = "tmnt_facility_cost"

    node_id = Column(String, primary_key=True)

    # cost attrs
    capital_cost = Column(Float)
    capital_cost_basis_year = Column(Float)
    om_cost_per_yr = Column(Float)
    om_cost_basis_year = Column(Float)
    install_year = Column(Float)
    lifespan_yrs = Column(Float)
    replacement_cost = Column(Float)

    # cost results
    present_value_capital_cost = Column(Float)
    present_value_om_cost = Column(Float)
    present_value_total_cost = Column(Float)
    present_value_om_cost_table = Column(JSONB)
