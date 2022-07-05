import json
from typing import Any, Dict

import geopandas
import numpy
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

import stormpiper.bg_worker as bg
from stormpiper.apps.supersafe.users import check_admin
from stormpiper.core import utils
from stormpiper.database.connection import engine

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
            .reindex(columns=['node_id', 'altid', 'relid', 'subbasin', 'basinname', 'geometry'])
        )

        json_str = out.pipe(utils.datetime_to_isoformat).to_crs(4326).to_json()

        return json.loads(json_str)
