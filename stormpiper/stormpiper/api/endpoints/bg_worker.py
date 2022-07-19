import json
from enum import Enum
from typing import Any, Dict

import geopandas
import numpy
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

import stormpiper.bg_worker as bg
from stormpiper.apps.supersafe.users import check_admin
from stormpiper.core import utils
from stormpiper.database.connection import engine
from stormpiper.src.solve_structural_wq import solve_wq_epochs_from_db

router = APIRouter(dependencies=[Depends(check_admin)])
rpc_router = APIRouter(dependencies=[Depends(check_admin)])

# Rest Routes


@router.get("/{task_id}", response_class=JSONResponse)
async def get_task(task_id: str) -> Dict[str, Any]:

    task = bg.celery_app.AsyncResult(task_id)
    response = dict(task_id=task.task_id, status=task.status)
    if task.successful():
        response["data"] = task.result

    return response


# RPC Routes
class StrEnum(str, Enum):
    ...


# TaskName = create_model("TaskName", **{k: k for k in bg.celery_app.tasks.keys()}, __base__=StrEnum)
_tasks = [k for k in sorted(bg.celery_app.tasks.keys()) if "bg_worker" in k]
TaskName = StrEnum("TaskName", {k: k for k in _tasks})


@rpc_router.get("/run_task", response_class=JSONResponse)
async def run_task(taskname: TaskName) -> Dict[str, Any]:

    task = bg.celery_app.send_task(taskname)
    _ = await utils.wait_a_sec_and_see_if_we_can_return_some_data(task, timeout=0.5)
    response = dict(task_id=task.task_id, status=task.status)
    if task.successful():
        response["data"] = task.result

    return response


@rpc_router.get("/ping_background", response_class=JSONResponse)
async def ping_background() -> Dict[str, Any]:

    task = bg.ping.apply_async()
    response = dict(task_id=task.task_id, status=task.status)
    if task.successful():
        response["data"] = task.result

    return response


@rpc_router.get("/delete_and_refresh_tacoma_gis_tables", response_class=JSONResponse)
async def delete_and_refresh_tacoma_gis_tables() -> Dict[str, Any]:

    task = bg.delete_and_refresh_tacoma_gis_tables.apply_async()
    response = dict(task_id=task.task_id, status=task.status)
    if task.successful():
        response["data"] = task.result

    return response


@rpc_router.get("/overlay_rodeo", response_class=JSONResponse)
async def overlay_rodeo() -> Dict[str, Any]:

    with engine.begin() as conn:
        delin = geopandas.read_postgis("tmnt_facility_delineation", con=conn)
        subs = geopandas.read_postgis("subbasin", con=conn)
        out = (
            geopandas.overlay(delin, subs, how="union", keep_geom_type=True)
            .assign(subbasin=lambda df: df["subbasin"].fillna("None").astype(str))
            .assign(
                node_id=lambda df: numpy.where(
                    df["node_id"].isna(),
                    "SB_" + df["subbasin"],
                    df["node_id"] + "_SB_" + df["subbasin"],
                )
            )
            .loc[lambda df: df.geometry.area > 1.0]
            .reindex(
                columns=[
                    "node_id",
                    "altid",
                    "relid",
                    "subbasin",
                    "basinname",
                    "geometry",
                ]
            )
        )

        json_str = out.pipe(utils.datetime_to_isoformat).to_crs(4326).to_json()

        return json.loads(json_str)


@rpc_router.get("/solve_watershed", response_class=JSONResponse)
async def solve_watershed() -> Dict[str, Any]:

    df = solve_wq_epochs_from_db()

    return {"results": df.head(10).to_dict(orient="records")}
