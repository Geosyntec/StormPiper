from inspect import getmembers, isfunction
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

import stormpiper.bg_worker as bg
from stormpiper.apps.supersafe.users import user_role_ge_admin, user_role_ge_editor
from stormpiper.core import utils
from stormpiper.models.base import StrEnum
from stormpiper.models.bg import TaskModel
from stormpiper.src import tasks

router = APIRouter(dependencies=[Depends(user_role_ge_editor)])
rpc_router_admin = APIRouter(dependencies=[Depends(user_role_ge_admin)])
rpc_router = APIRouter(dependencies=[Depends(user_role_ge_editor)])
# Rest Routes


@router.get("/{task_id}", response_model=TaskModel)
async def get_task(task_id: str) -> Dict[str, Any]:
    task = bg.celery_app.AsyncResult(task_id)
    return await utils.generate_task_response(task)


# RPC Routes


_tasks = [k for k in sorted(bg.celery_app.tasks.keys()) if "bg_worker" in k]
TaskName: StrEnum = StrEnum("TaskName", {k: k for k in _tasks})


@rpc_router_admin.get("/run_task/{taskname}", response_class=JSONResponse)
async def run_task(
    taskname: TaskName,  # type: ignore
) -> Dict[str, Any]:
    task = bg.celery_app.send_task(taskname)
    return await utils.generate_task_response(task)


_tasks = sorted([k for k in bg.Workflows.__dict__.keys() if not k.startswith("__")])
Workflows = StrEnum("Workflows", {k: k for k in _tasks})


@rpc_router_admin.get("/run_workflow/{taskname}", response_class=JSONResponse)
async def run_workflow(
    taskname: Workflows,  # type: ignore
) -> Dict[str, Any]:
    t = getattr(bg.Workflows, taskname, None)

    if t is None:
        raise HTTPException(status_code=404, detail=f"not found: {taskname}")

    task = t.apply_async()
    return await utils.generate_task_response(task)


@rpc_router.get("/ping_background", response_class=JSONResponse)
async def ping_background() -> Dict[str, Any]:
    task = bg.ping.apply_async()
    return await utils.generate_task_response(task)


@rpc_router.get("/solve_watershed", response_class=JSONResponse, tags=["rpc"])
async def solve_watershed() -> Dict[str, Any]:
    task = bg.delete_and_refresh_all_results_tables.apply_async()
    return await utils.generate_task_response(task)


@rpc_router_admin.get("/_test_upstream_loading", response_class=JSONResponse)
async def us_loading() -> None:
    tasks.delete_and_refresh_upstream_src_ctrl_tables()
    tasks.delete_and_refresh_downstream_src_ctrl_tables()


@rpc_router_admin.get("/_test_solve_wq", response_class=JSONResponse)
async def solve_wq() -> None:
    tasks.delete_and_refresh_result_table()


_tasks = sorted([k for k, _ in getmembers(tasks, isfunction)])
ForegroundTasks = StrEnum("ForegroundTasks", {k: k for k in _tasks})


@rpc_router_admin.get("/run_foreground/{taskname}", response_class=JSONResponse)
async def run_foreground_task(
    taskname: ForegroundTasks,  # type: ignore
) -> None:
    t = getattr(tasks, taskname, None)

    if t is None:
        raise HTTPException(status_code=404, detail=f"not found: {taskname}")

    _ = t()
