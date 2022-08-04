from sqlalchemy import Column, DateTime, Integer, String, func


from .base_class import Base, TrackedTable


class TableChangeLog(Base, TrackedTable):
    """This table comes directly from the Tacoma GIS team.

    The node_id column is computed at the time of insertion.
    """

    __tablename__ = "tablechangelog"

    id = Column(Integer, primary_key=True)
    tablename = Column(String, index=True)
    last_updated = Column(DateTime(timezone=True), default=func.now())
