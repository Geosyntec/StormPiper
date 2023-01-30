from sqlalchemy import Column, String, Table

from stormpiper.database.connection import engine

# import directly from base_class so that imports work when this table is not initialized.
# This is because the ORM object is from a view rather than an actual table and I
# didn't want to write a huge sa.selectable() to re-define it -- its already defined in sql.
from .base_class import Base


class SubbasinResult_View(Base):
    __table__ = Table(
        "subbasinresult_v",
        Base.metadata,
        Column("subbasin", String, primary_key=True),
        Column("node_id", String, primary_key=True),
        Column("epoch", String, primary_key=True),
        info=dict(is_view=True),  # Flag this as a view
        autoload_with=engine,
    )
