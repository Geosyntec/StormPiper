import json
import logging

import geopandas
import orjson
import pandas
import sqlalchemy as sa

from stormpiper.core.config import POCS, settings
from stormpiper.core.utils import datetime_now
from stormpiper.database.changelog import sync_log
from stormpiper.database.connection import engine, get_session
from stormpiper.database.schemas.scenario import Scenario
from stormpiper.database.utils import orm_to_dict
from stormpiper.models.scenario import ScenarioSolve
from stormpiper.src import loading, solve_structural_wq

from .graph import build_edge_list
from .loading import compute_loading
from .met import create_met_dataframe
from .tmnt import spatial

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


def compute_scenario_loading_df(delin_json: str, engine=engine):
    scenario_delin = spatial.scenario_delin_json_to_gdf(delin_json)
    scenario_lgu_boundary = spatial.overlay_rodeo_for_scenario_from_database(
        scenario_delin=scenario_delin, engine=engine
    )

    scenario_loading = compute_loading(lgu_boundary=scenario_lgu_boundary)

    return scenario_lgu_boundary, scenario_loading


def build_scenario_edge_list(lgu_boundary: str, tmnt_json: str, engine=engine):
    _tmnt_v = spatial.scenario_json_to_gdf(tmnt_json)
    tmnt_v = spatial.assign_subbasin_to_points(_tmnt_v, engine=engine)

    lgu_b = spatial.scenario_json_to_gdf(lgu_boundary)
    edge_list = build_edge_list(lgu_b, tmnt_v)

    return edge_list


def maybe_include_cost_effectiveness(data: dict) -> dict:
    struct_tmnt_list = data.get("structural_tmnt", None) or []
    results_raw = data.get("structural_tmnt_result", None) or []
    tmnt_results = list(
        filter(
            lambda dct: (
                dct.get("ntype", None) == "tmnt_facility"
                and dct.get("epoch", None) == "1980s"
            ),
            results_raw,
        )
    )

    if not struct_tmnt_list or not tmnt_results:
        return data

    for fac in struct_tmnt_list:
        for poc in POCS:
            fac[f"{poc}_total_cost_dollars_per_load_lbs_removed"] = None

        node_id = fac["node_id"]
        pvtc = fac.get("present_value_total_cost", None)
        if pvtc is None:
            continue

        fac_result_dct = next(  # pragma: no branch
            (dct for dct in tmnt_results if dct["node_id"] == node_id), None
        )
        if fac_result_dct is None:
            continue  # pragma: no cover

        for poc in POCS:
            load_reduced = fac_result_dct.get(f"{poc}_load_lbs_removed", 0)
            if load_reduced > 0:
                fac[f"{poc}_total_cost_dollars_per_load_lbs_removed"] = (
                    pvtc / load_reduced
                )

    return data


def solve_scenario_data(data: dict, force=False, engine=None) -> dict:
    """if 'force' is false, then only missing fields will be filled."""
    input_ = data.get("input", None) or {}
    delin_collection = input_.get("delineation_collection", {})
    recalculate_loading = delin_collection and (
        force or any([f is None for f in [data.get(k, None) for k in ["lgu_load"]]])
    )
    tmnt_collection = input_.get("tmnt_facility_collection", {})
    recalculate_wq = (delin_collection and tmnt_collection) and (
        force
        or recalculate_loading
        or any(
            [f is None for f in [data.get(k, None) for k in ["structural_tmnt_result"]]]
        )
    )

    if recalculate_loading:
        logger.info("SCENARIO: Calling re-calculate scenario loading.")
        lgu_boundary, lgu_load = compute_scenario_loading_df(
            orjson.dumps(delin_collection).decode()
        )

        data["lgu_boundary"] = orjson.loads(
            lgu_boundary.to_crs(epsg=4326).to_json()  # type: ignore
        )
        data["lgu_load"] = lgu_load.to_dict(orient="records")

        data["delin_load"] = (
            lgu_load.merge(lgu_boundary[["node_id", "altid"]], on="node_id", how="left")  # type: ignore
            .groupby(["epoch", "altid", "variable", "units"], as_index=False)[["value"]]
            .sum()
        ).to_dict(orient="records")

    if recalculate_wq:
        logger.info("SCENARIO: Calling recalculate scenario wq results")

        lgu_b = orjson.dumps(data["lgu_boundary"]).decode()
        tmnt_json = orjson.dumps(tmnt_collection).decode()

        edge_list = build_scenario_edge_list(lgu_boundary=lgu_b, tmnt_json=tmnt_json)
        data["graph_edge"] = edge_list.to_dict(orient="records")

        met = create_met_dataframe()
        if engine is not None:
            with engine.begin() as conn:
                met = pandas.read_sql("met", con=conn)

        epochs = list(met.epoch.unique())
        zones = geopandas.read_file(orjson.dumps(data["lgu_boundary"]).decode()).to_crs(
            epsg=settings.TACOMA_EPSG
        )  # type: ignore
        land_surface_load_nereid = pandas.DataFrame(data["lgu_load"])

        nereid_load_df = land_surface_load_nereid.pipe(
            loading.land_surface_load_nereid, zones, met
        )
        tmnt_facilities = pandas.DataFrame(data["structural_tmnt"])

        result = solve_structural_wq.solve_wq_epochs(
            edge_list=edge_list,
            met=met,
            loading=nereid_load_df,
            tmnt_facilities=tmnt_facilities,
            epochs=epochs,
            embed_watershed=True,
        ).assign(blob=lambda df: df["blob"].apply(json.loads))

        result_blob = json.loads(result.to_json(orient="records"))

        data["structural_tmnt_result"] = result_blob

    data = maybe_include_cost_effectiveness(data)

    if recalculate_loading or recalculate_wq:
        data["result_time_updated"] = datetime_now()

    else:
        logger.info("SCENARIO: Inputs are unchanged. Updating changelog only.")

    return data


def solve_scenario_db(data: dict, engine=engine) -> dict:
    Session = get_session(engine=engine)
    data = ScenarioSolve(**data).model_dump(exclude_unset=True)
    id_ = str(data["id"])
    res = {}
    with Session.begin() as session:  # type: ignore
        q = (
            sa.update(Scenario)
            .where(Scenario.id == id_)
            .values(data)
            .returning(Scenario)
        )
        res = session.scalars(q).first()
        res = orm_to_dict(res)

        logger.info("recording table change...")
        sync_log(tablename="scenario", db=session)

    return res
