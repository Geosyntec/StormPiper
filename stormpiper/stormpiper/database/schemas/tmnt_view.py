from sqlalchemy import Column, String, Table

from stormpiper.database.connection import engine

from .base_class import Base
from .tmnt import TMNTFacility, TMNTFacilityAttr

t_cols = [k for k in TMNTFacility.__table__.columns.keys() if k not in ["id"]]
ta_cols = [
    k for k in TMNTFacilityAttr.__table__.columns.keys() if k not in ["id"] + t_cols
]


def build_view_template():

    tcols = [f"""\tt."{s}", """ for s in t_cols]
    tacols = [f"""\tta."{s}", """ for s in ta_cols]
    tacols[-1] = tacols[-1].replace(", ", " ")

    block = "\n".join(tcols + tacols)

    view_template = f"""select
{block}
from tmnt_facility as t JOIN tmnt_facility_attributes as ta on t.altid = ta.altid
"""
    return view_template


class TMNT_View(Base):
    __table__ = Table(
        "tmnt_v",
        Base.metadata,
        Column("node_id", String, primary_key=True),
        info=dict(is_view=True),  # Flag this as a view
        autoload_with=engine,
    )
