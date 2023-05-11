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
    select_fields = []
    sub_cols = ",\n".join([f"""\ts."{s}" """ for s in s_cols])
    subr_cols = ",\n".join([f"""\tsr."{s}" """ for s in sr_cols])

    cuft_per_acre_to_inch = 0.0002754821  # ac*in
    lbs_per_cuft_to_mgl = 16018.46337  # lbs/cuft to mgl
    depth_col_calc = f"""\tsr."runoff_volume_cuft" * {cuft_per_acre_to_inch} / s.area_acres as "{depth_col}" """
    conc_col_block = ",\n".join(
        [
            f"""\tsr."{load_col}" / sr."runoff_volume_cuft" * {lbs_per_cuft_to_mgl} as "{conc_col}" """
            for load_col, conc_col in zip(load_cols, conc_cols)
        ]
    )
    yield_col_calcs = [
        f"""\tsr."{load_col}" / s.area_acres as "{yield_col}" """
        for load_col, yield_col in zip(load_cols, yield_cols)
    ]

    yield_col_block = ",\n".join([depth_col_calc] + yield_col_calcs)
    summary_fields = ",\n".join(
        [
            "DIST_ALTID.TMNT_FACILITY_COUNT",
            "TS.TOTAL_AREA_ACRES",
            "TS.BASICWQ_AREA_ACRES",
            "TS.BASICWQ_AREA_PCT",
            "TS.ENHWQ_AREA_ACRES",
            "TS.ENHWQ_AREA_PCT",
            "TS.FC_AREA_ACRES",
            "TS.FC_AREA_PCT",
        ]
    )
    select_fields = ",\n".join(
        [sub_cols, subr_cols, conc_col_block, yield_col_block, summary_fields]
    )
    select_fields = select_fields[:-3] + select_fields[-3:].replace(",", "")

    view_template = f"""
DROP VIEW IF EXISTS subbasinresult_v;
CREATE OR REPLACE VIEW subbasinresult_v AS
WITH Q AS
	(SELECT RELID,
			SUBBASIN,
			GEOM,
			ST_AREA(GEOM) / 43560 AS "area_acres",
			TMNT.ALTID,
			TMNT.FLOWCONTROLTYPE,
			TMNT.WATERQUALITYTYPE
		FROM LGU_BOUNDARY LGU
		LEFT JOIN
			(SELECT ALTID,
					FLOWCONTROLTYPE,
					WATERQUALITYTYPE
				FROM TMNT_FACILITY) TMNT ON TMNT.ALTID = LGU.RELID),
	TOTALAREA AS
	(SELECT Q.SUBBASIN,
			SUM(Q.AREA_ACRES) AS "total_area_acres"
		FROM Q
		GROUP BY (Q.SUBBASIN)
		ORDER BY (Q.SUBBASIN)),
	BASICWQAREA AS
	(SELECT Q.SUBBASIN,
			SUM(Q.AREA_ACRES) AS "basicwq_area_acres"
		FROM Q
		WHERE Q.WATERQUALITYTYPE = 'Basic'
		GROUP BY Q.SUBBASIN
		ORDER BY Q.SUBBASIN),
	ENHWQAREA AS
	(SELECT Q.SUBBASIN,
			SUM(Q.AREA_ACRES) AS "enhwq_area_acres"
		FROM Q
		WHERE Q.WATERQUALITYTYPE = 'Enhanced'
		GROUP BY Q.SUBBASIN
		ORDER BY Q.SUBBASIN),
	FCAREA AS
	(SELECT Q.SUBBASIN,
			SUM(Q.AREA_ACRES) AS "fc_area_acres"
		FROM Q
		WHERE Q.FLOWCONTROLTYPE IS NOT NULL
		GROUP BY Q.SUBBASIN
		ORDER BY Q.SUBBASIN),
	TMNTSUMMARY AS
	(SELECT S.SUBBASIN,
			TA.TOTAL_AREA_ACRES,
			BWQ.BASICWQ_AREA_ACRES,
			100 * (BWQ.BASICWQ_AREA_ACRES / TA.TOTAL_AREA_ACRES) AS "basicwq_area_pct",
			EWQ.ENHWQ_AREA_ACRES,
			100 * (EWQ.ENHWQ_AREA_ACRES / TA.TOTAL_AREA_ACRES) AS "enhwq_area_pct",
			FC.FC_AREA_ACRES,
			100 * (FC.FC_AREA_ACRES / TA.TOTAL_AREA_ACRES) AS "fc_area_pct"
		FROM SUBBASIN S
		LEFT JOIN TOTALAREA TA ON TA.SUBBASIN = S.SUBBASIN
		LEFT JOIN BASICWQAREA BWQ ON BWQ.SUBBASIN = S.SUBBASIN
		LEFT JOIN ENHWQAREA EWQ ON EWQ.SUBBASIN = S.SUBBASIN
		LEFT JOIN FCAREA FC ON FC.SUBBASIN = S.SUBBASIN
		ORDER BY S.SUBBASIN)

select
{select_fields}
FROM subbasin s
LEFT JOIN subbasin_result sr ON sr.subbasin::text = s.subbasin::text
LEFT JOIN
    (SELECT b.subbasin,
            count(DISTINCT b.altid)::integer AS tmnt_facility_count
        FROM lgu_boundary b
        GROUP BY b.subbasin
        ORDER BY b.subbasin) dist_altid ON dist_altid.subbasin::text = s.subbasin::text
LEFT JOIN
	(SELECT *
		FROM TMNTSUMMARY) TS ON TS.SUBBASIN = S.SUBBASIN
ORDER BY S.SUBBASIN;
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

    tcols = [f"""\tt."{s}" """ for s in t_cols]

    tatscols = [f"""\tta."{s}" as "modeling_attr_{s}" """ for s in ts_cols]
    tacols = [f"""\tta."{s}" """ for s in ta_cols]

    tctscols = [f"""\ttc."{s}" as "cost_attr_{s}" """ for s in ts_cols]
    tccols = [f"""\ttc."{s}" """ for s in tc_cols]
    costploadclos = [
        f"""tc.present_value_total_cost / nullif(COALESCE(nullif(sign(r."{poc}_removed"),-1),0)*r."{poc}_removed", 0) AS "{poc.split("_")[0]}_total_cost_dollars_per_load_lbs_removed" """
        for poc in load_cols
    ]

    block = ",\n".join(tcols + tatscols + tacols + tctscols + tccols + costploadclos)

    view_template = f"""
DROP VIEW IF EXISTS tmnt_v;
CREATE OR REPLACE VIEW tmnt_v AS
select
{block}
from tmnt_facility as t
    LEFT JOIN tmnt_facility_attribute as ta on t.node_id = ta.node_id
    LEFT JOIN tmnt_facility_cost as tc on t.node_id = tc.node_id
    LEFT JOIN (SELECT * from result_blob where epoch = '1980s') as r ON t.node_id = r.node_id
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
