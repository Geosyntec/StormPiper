from sqlalchemy import Column, String, Table

from stormpiper.database.connection import engine

from .base_class import Base
from .subbasin import Subbasin, SubbasinResult

s_cols = [k for k in Subbasin.__table__.columns.keys() if k != "id"]
sr_cols = [
    k for k in SubbasinResult.__table__.columns.keys() if k not in ["id", "subbasin"]
]
depth_col = "runoff_depth_inches"
load_cols = [n for n in sr_cols if "_load_" in n]
yield_cols = [n.replace("_load_lbs", "_yield_lbs_per_acre") for n in load_cols]

COLS = [
    *s_cols,
    *sr_cols,
    depth_col,
    *yield_cols,
]


def build_view_template():

    sub_cols = "\n".join([f"""\ts."{s}",""" for s in s_cols])
    subr_cols = "\n".join([f"""\tsr."{s}",""" for s in sr_cols])

    cuft_per_acre_to_inch = 0.0002754821  # ac*in
    depth_col_calc = f"""\tsr."runoff_volume_cuft" * {cuft_per_acre_to_inch} / s.area_acres as "{depth_col}", """
    yield_col_calcs = [
        f"""\tsr."{load_col}" / s.area_acres as "{yield_col}", """
        for load_col, yield_col in zip(load_cols, yield_cols)
    ]
    yield_col_calcs[-1] = yield_col_calcs[-1].replace(", ", " ")

    yield_col_block = "\n".join([depth_col_calc] + yield_col_calcs)

    view_template = f"""select
{sub_cols}
{subr_cols}
{yield_col_block}
from subbasin_result as sr JOIN subbasin as s on sr.subbasin = s.subbasin
"""
    return view_template


class SubbasinResult_View(Base):
    __table__ = Table(
        "subbasinresult_v",
        Base.metadata,
        Column("node_id", String, primary_key=True),
        Column("epoch", String, primary_key=True),
        info=dict(is_view=True),  # Flag this as a view
        autoload_with=engine,
    )
