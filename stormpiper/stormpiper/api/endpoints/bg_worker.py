from enum import Enum
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

import stormpiper.bg_worker as bg
from stormpiper.apps.supersafe.users import check_admin
from stormpiper.core import utils

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
TaskName: StrEnum = StrEnum("TaskName", {k: k for k in _tasks})


@rpc_router.get("/run_task/{taskname}", response_class=JSONResponse)
async def run_task(
    taskname: TaskName, timeout: float = Query(0.5, le=120)
) -> Dict[str, Any]:

    task = bg.celery_app.send_task(taskname)
    _ = await utils.wait_a_sec_and_see_if_we_can_return_some_data(task, timeout=timeout)
    response = dict(task_id=task.task_id, status=task.status)
    if task.successful():
        response["data"] = task.result

    return response


_tasks = sorted([k for k in bg.Workflows.__dict__.keys() if not k.startswith("_")])
Workflows = StrEnum("Workflows", {k: k for k in _tasks})


@rpc_router.get("/run_workflow/{taskname}", response_class=JSONResponse)
async def run_workflow(
    taskname: Workflows, timeout: float = Query(0.5, le=120)
) -> Dict[str, Any]:

    t = getattr(bg.Workflows, taskname, None)

    if t is None:
        raise HTTPException(status_code=404, detail=f"not found: {taskname}")

    task = t.apply_async()

    _ = await utils.wait_a_sec_and_see_if_we_can_return_some_data(task, timeout=timeout)
    response = dict(task_id=task.id, status=task.status)
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


@rpc_router.get("/solve_watershed", response_class=JSONResponse)
async def solve_watershed() -> Dict[str, Any]:

    task = bg.Workflows.refresh_results.apply_async()
    response = dict(task_id=task.task_id, status=task.status)
    if task.successful():
        response["data"] = task.result

    return response
