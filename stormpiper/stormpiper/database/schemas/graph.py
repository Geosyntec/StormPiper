from sqlalchemy import Column, Integer, String

from .base_class import Base


class GraphEdge(Base):
    """This table is recreated when any nodes (facilites, delineations, or untreated land surfaces)
    are added or moved.

    `source` is a node_id that is allowed exactly one target (hence unique).
    `target` is also a node_id that receives the discharges from `source`
    """

    __tablename__ = "graph_edge"

    id = Column(Integer, primary_key=True)
    source = Column(String, unique=True, nullable=False)
    target = Column(String, nullable=False)
    ntype = Column(String)
    subbasin = Column(String)
    basinname = Column(String)
