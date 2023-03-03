from fastapi import APIRouter, Depends

import stormpiper.bg_worker as bg
from stormpiper.apps.supersafe.users import user_role_ge_reader
from stormpiper.core.utils import generate_task_response
from stormpiper.models.bg import TaskModel
from stormpiper.models.prom import PromRequest

rpc_router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@rpc_router.post(
    "/calculate_subbasin_promethee_prioritization",
    tags=["rpc"],
    response_model=TaskModel,
)
async def calculate_subbasin_promethee_prioritization(prom: PromRequest):
    task = bg.calculate_subbasin_promethee_prioritization.apply_async(
        kwargs={"data": prom.dict()}
    )
    return await generate_task_response(task=task)
