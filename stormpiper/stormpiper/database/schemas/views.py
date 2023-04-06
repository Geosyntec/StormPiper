from sqlalchemy import inspect, text

from .subbasin import Subbasin, SubbasinResult
from .tmnt import TMNTFacility, TMNTFacilityAttr
from .tmnt_cost import TMNTFacilityCost

s_cols = [k for k in Subbasin.__table__.columns.keys() if k != "id"]
sr_cols = [
    k for k in SubbasinResult.__table__.columns.keys() if k not in ["id", "subbasin"]
]
depth_col = "runoff_depth_inches"
load_cols = [n for n in sr_cols if n.endswith("_load_lbs")]
yield_cols = [n.replace("_load_lbs", "_yield_lbs_per_acre") for n in load_cols]
conc_cols = [n.replace("_load_lbs", "_conc_mg/l") for n in load_cols]

COLS = [
    *s_cols,
    *sr_cols,
    depth_col,
    *yield_cols,
    *conc_cols,
]


def build_subbasinresult_v():
    sub_cols = "\n".join([f"""\ts."{s}",""" for s in s_cols])
    subr_cols = "\n".join([f"""\tsr."{s}",""" for s in sr_cols])

    cuft_per_acre_to_inch = 0.0002754821  # ac*in
    lbs_per_cuft_to_mgl = 16018.46337  # lbs/cuft to mgl
    depth_col_calc = f"""\tsr."runoff_volume_cuft" * {cuft_per_acre_to_inch} / s.area_acres as "{depth_col}", """
    conc_col_block = "\n".join(
        [
            f"""\tsr."{load_col}" / sr."runoff_volume_cuft" * {lbs_per_cuft_to_mgl} as "{conc_col}", """
            for load_col, conc_col in zip(load_cols, conc_cols)
        ]
    )
    yield_col_calcs = [
        f"""\tsr."{load_col}" / s.area_acres as "{yield_col}", """
        for load_col, yield_col in zip(load_cols, yield_cols)
    ]
    yield_col_calcs[-1] = yield_col_calcs[-1].replace(", ", " ")

    yield_col_block = "\n".join([depth_col_calc] + yield_col_calcs)

    view_template = f"""
DROP VIEW IF EXISTS subbasinresult_v;
CREATE OR REPLACE VIEW subbasinresult_v AS
select
{sub_cols}
{subr_cols}
{conc_col_block}
{yield_col_block}
from subbasin_result as sr JOIN subbasin as s on sr.subbasin = s.subbasin
"""
    return view_template


def build_tmnt_v():
    ts_cols = ["time_created", "time_updated", "updated_by"]

    t_cols = [k for k in TMNTFacility.__table__.columns.keys() if k not in ["id"]]

    ta_cols = [
        k
        for k in TMNTFacilityAttr.__table__.columns.keys()
        if k not in ["id"] + t_cols + ts_cols
    ]

    tc_cols = [
        k
        for k in TMNTFacilityCost.__table__.columns.keys()
        if k not in ["node_id"] + t_cols + ta_cols + ts_cols
    ]

    tcols = [f"""\tt."{s}", """ for s in t_cols]

    tatscols = [f"""\tta."{s}" as "modeling_attr_{s}", """ for s in ts_cols]
    tacols = [f"""\tta."{s}", """ for s in ta_cols]

    tctscols = [f"""\ttc."{s}" as "cost_attr_{s}", """ for s in ts_cols]
    tccols = [f"""\ttc."{s}", """ for s in tc_cols]
    tccols[-1] = tccols[-1].replace(", ", " ")

    block = "\n".join(tcols + tatscols + tacols + tctscols + tccols)

    view_template = f"""
DROP VIEW IF EXISTS tmnt_v;
CREATE OR REPLACE VIEW tmnt_v AS
select
{block}
from tmnt_facility as t
    JOIN tmnt_facility_attribute as ta on t.node_id = ta.node_id
    FULL OUTER JOIN tmnt_facility_cost as tc on t.node_id = tc.node_id
"""
    return view_template


VIEW_REGISTRY = [
    build_tmnt_v(),
    build_subbasinresult_v(),
]


def initialize_views(engine, views=VIEW_REGISTRY):
    existing_v = [_v for _v in inspect(engine).get_view_names() if _v.endswith("_v")]

    with engine.begin() as db:
        # stp views have a _v suffix so begin by removing all stp views.
        for _v in existing_v:
            db.execute(text(f"drop view {_v}"))

        # add back only the views in the current registry.
        for stmnt in views:
            db.execute(text(stmnt))
