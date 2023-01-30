from sqlalchemy import Column, String, Table

from stormpiper.database.connection import engine

from .base_class import Base


class TMNT_View(Base):
    __table__ = Table(
        "tmnt_v",
        Base.metadata,
        Column("node_id", String, primary_key=True),
        info=dict(is_view=True),  # Flag this as a view
        autoload_with=engine,
    )
