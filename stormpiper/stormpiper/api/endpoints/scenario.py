import logging
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import stormpiper.bg_worker as bg
from stormpiper.apps import supersafe as ss
from stormpiper.apps.supersafe.users import user_role_ge_editor
from stormpiper.core.config import settings
from stormpiper.core.context import get_context
from stormpiper.core.utils import generate_task_response
from stormpiper.database import crud, utils
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas.scenario import Scenario
from stormpiper.models.bg import TaskModel
from stormpiper.models.scenario import SCENARIO_EXAMPLES
from stormpiper.models.scenario import Scenario as ScenarioResponse
from stormpiper.models.scenario import (
    ScenarioCreate,
    ScenarioPost,
    ScenarioSolve,
    ScenarioUpdate,
)
from stormpiper.models.scenario_validator import scenario_validator
from stormpiper.src.npv import get_npv_settings_db

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


router = APIRouter(dependencies=[Depends(user_role_ge_editor)])
rpc_router = APIRouter(dependencies=[Depends(user_role_ge_editor)])


async def validate_scenario(
    scenario: ScenarioPost | dict[str, Any] = Body(..., examples=SCENARIO_EXAMPLES),
    user: ss.users.User = Depends(ss.users.current_active_user),
    db: AsyncSession = Depends(get_async_session),
    context: dict = Depends(get_context),
) -> ScenarioUpdate:
    if isinstance(scenario, BaseModel):
        scenario = scenario.dict(exclude_unset=True)
    scenario["updated_by"] = user.email

    try:
        npv_global_settings = await get_npv_settings_db(db=db)
        return scenario_validator(
            scenario=scenario, context=context, npv_global_settings=npv_global_settings
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )


@router.get(
    "/{id}",
    response_model=ScenarioResponse,
    name="scenario:get_scenario",
)
async def get_scenario(
    *,
    id: str,
    db: AsyncSession = Depends(get_async_session),
):
    attr = await crud.scenario.get(db=db, id=id)

    if not attr:
        raise HTTPException(status_code=404, detail=f"Record not found for id={id}")

    return attr


@router.get(
    "/{id}/{field}",
    response_class=ORJSONResponse,
    name="scenario:get_scenario_details",
)
async def get_scenario_details(
    *,
    id: str,
    field: str,
    db: AsyncSession = Depends(get_async_session),
):
    attr = await crud.scenario.get(db=db, id=id)

    if not attr:
        raise HTTPException(status_code=404, detail=f"Record not found for id={id}")

    if not hasattr(attr, field):
        raise HTTPException(
            status_code=404, detail=f"Record field not found for field={field}"
        )

    jsonable = getattr(attr, field)

    return jsonable


@router.delete("/{id}", name="scenario:delete")
async def delete_scenario(
    id: str,
    db: AsyncSession = Depends(get_async_session),
):
    try:
        attr = await crud.scenario.remove(db=db, id=id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return attr


@router.patch("/{id}", name="scenario:update")
async def update_scenario(
    id: str,
    scenario: ScenarioUpdate = Depends(validate_scenario),
    db: AsyncSession = Depends(get_async_session),
):
    attr = await crud.scenario.get(db=db, id=id)

    if not attr:
        raise HTTPException(status_code=404, detail=f"Record not found for id={id}")

    loading_hash = scenario.loading_hash
    input_hash = scenario.input_hash

    logger.debug(f"old hash: {attr.loading_hash} new hash: {loading_hash}")

    data = scenario.dict(exclude_unset=True)
    recalculate_loading = attr.loading_hash != loading_hash
    recalculate_wq = attr.input_hash != input_hash

    if recalculate_loading:
        logger.info("SCENARIO: Clearing prev scenario loading results.")

        data["lgu_boundary"] = None
        data["lgu_load"] = None
        data["delin_load"] = None

    if recalculate_wq:
        logger.info("SCENARIO: Clearing scenario wq results")
        data["graph_edge"] = None
        data["structural_tmnt_result"] = None
        data.pop("input_time_updated", None)

    else:
        logger.info("SCENARIO: Inputs are unchanged. Updating changelog only.")

    try:
        new_obj = ScenarioUpdate(**data)
        attr = await crud.scenario.update(db=db, id=id, new_obj=new_obj)

    except Exception as e:
        await db.rollback()
        # raise
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )
    logger.info(f"SCENARIO: Updated scenario with id: {attr.id}")
    return attr


@router.get(
    "/",
    response_model=list[ScenarioResponse],
    name="scenario:get_all_scenarios",
)
async def get_all_scenarios(
    *,
    limit: None | int = None,
    offset: None | int = None,
    db: AsyncSession = Depends(get_async_session),
):
    q = select(Scenario).order_by(Scenario.time_created).offset(offset).limit(limit)
    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars


@router.post("/", name="scenario:create", response_model=ScenarioResponse)
async def create_scenario(
    scenario: ScenarioCreate = Depends(validate_scenario),
    db: AsyncSession = Depends(get_async_session),
):
    logger.info(scenario.json())
    try:
        attr = await crud.scenario.create(db=db, new_obj=scenario)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    logger.info(f"created new scenario with id: {attr.id}")

    return attr


@rpc_router.post(
    "/solve_scenario/{id}", name="scenario:solve_id", response_model=TaskModel
)
async def solve_single_scenario(
    id: str,
    force: bool = Query(False),
    db: AsyncSession = Depends(get_async_session),
):
    """implement solve-all in the frontend."""
    attr = await crud.scenario.get(db=db, id=id)

    if not attr:
        raise HTTPException(status_code=404, detail=f"Record not found for id={id}")

    data = ScenarioSolve(**utils.orm_to_dict(attr)).dict(exclude_unset=True)

    task = bg.update_scenario_results.apply_async(kwargs={"data": data, "force": force})

    return await generate_task_response(task=task)


@rpc_router.post(
    "/solve_all_scenarios", name="scenario:solve_all", response_model=TaskModel
)
async def solve_all_scenarios(
    force: bool = Query(False),
    db: AsyncSession = Depends(get_async_session),
):
    raise DeprecationWarning(
        "this functionality should be supported by the frontend, not the backend."
    )
    attrs = await crud.scenario.get_all(db=db)

    if not attrs:
        raise HTTPException(status_code=404, detail=f"Records not found.")

    data_list = [
        ScenarioSolve(**utils.orm_to_dict(attr)).dict(exclude_unset=True)
        for attr in attrs
    ]

    task = bg.update_all_scenario_results.apply_async(
        kwargs={"data_list": data_list, "force": force}
    )

    response = dict(task_id=task.task_id, status=task.status)

    return response


@rpc_router.post("/solve_scenario", name="scenario:solve", response_model=TaskModel)
async def solve_scenario(
    scenario: ScenarioCreate = Depends(validate_scenario),
):
    """Stateless solves of scenarios with identical logic as the stateful variant."""
    data = scenario.dict(exclude_unset=True)
    task = bg.compute_scenario_results.apply_async(kwargs={"data": data})
    return await generate_task_response(task=task)
