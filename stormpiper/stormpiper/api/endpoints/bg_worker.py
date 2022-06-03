from typing import Any, Dict

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

import stormpiper.bg_worker as bg
from stormpiper.apps.supersafe.users import check_admin

##
from stormpiper.database.connection import engine
from stormpiper.core import utils
import geopandas

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
