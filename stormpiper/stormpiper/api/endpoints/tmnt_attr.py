from typing import Any

from fastapi import APIRouter, Body, Depends, Path, Query, Request, status
from fastapi.concurrency import run_in_threadpool
from fastapi.exceptions import HTTPException
from nereid.api.api_v1.models.treatment_facility_models import STRUCTURAL_FACILITY_TYPE
from pydantic import BaseModel
from sqlalchemy import select

from stormpiper.apps.supersafe.users import user_role_ge_editor, user_role_ge_reader
from stormpiper.database import crud
from stormpiper.database.schemas import tmnt_view as tmnt
from stormpiper.models.tmnt_attr import (
    TMNTFacilityAttrPatch,
    TMNTFacilityCostPatch,
    TMNTFacilityPatch,
    TMNTUpdate,
)
from stormpiper.models.tmnt_attr_validator import tmnt_attr_validator
from stormpiper.models.tmnt_view import TMNTView
from stormpiper.src.npv import get_pv_settings_db

from ..depends import AsyncSessionDB, Editor

router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@router.get(
    "/{node_id}",
    response_model=TMNTView,
    name="tmnt_facility_attr:get_tmnt_attr",
)
async def get_tmnt_attr(node_id: str, db: AsyncSessionDB):
    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.node_id == node_id)
    )

    if not result:  # pragma: no cover
        raise HTTPException(
            status_code=404, detail=f"Record not found for node_id={node_id}"
        )

    return result.scalars().first()


async def validate_tmnt_update(
    request: Request,
    db: AsyncSessionDB,
    user: Editor,
    tmnt_patch: dict[str, Any]
    | TMNTFacilityCostPatch
    | TMNTFacilityAttrPatch
    | TMNTFacilityPatch
    | STRUCTURAL_FACILITY_TYPE = Body(
        ...,
        example={  # example required since default example is empty dict
            "facility_type": "bioretention_with_partial_infiltration_simple",
            "captured_pct": 80,
            "retained_pct": 20,
            "capital_cost": 450_000,  # $
            "capital_cost_basis_year": 2023,
            "om_cost_per_yr": 6000,  # $
            "om_cost_basis_year": 2023,
            "install_year": 2027,  # future project
            "replacement_cost": 450000 / 2,  # incurred at end of lifespan.
            "lifespan_yrs": 15,
        },
    ),
) -> TMNTUpdate:
    if isinstance(tmnt_patch, BaseModel):  # pragma: no cover
        tmnt_patch = tmnt_patch.dict(exclude_unset=True)
    tmnt_patch["updated_by"] = user.email
    context = request.state.context

    try:
        pv_global_settings = await get_pv_settings_db(db=db)
        return await run_in_threadpool(
            tmnt_attr_validator,
            tmnt_patch=tmnt_patch,
            context=context,
            pv_global_settings=pv_global_settings,
        )

    except Exception as e:  # pragma no cover
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )


@router.patch(
    "/{node_id}",
    response_model=TMNTView,
    name="tmnt_facility_attr:patch_tmnt_attr",
    dependencies=[Depends(user_role_ge_editor)],
)
async def patch_tmnt_attr(
    *,
    db: AsyncSessionDB,
    node_id: str = Path(..., example="SWFA-100002"),
    tmnt_update: TMNTUpdate = Depends(validate_tmnt_update),
):
    ex_obj = await crud.tmnt_attr.get(db=db, id=node_id)

    if not ex_obj:
        raise HTTPException(
            status_code=404, detail=f"Record not found for node_id={node_id}"
        )

    if tmnt_update.tmnt_attr is not None:
        _ = await crud.tmnt_attr.update(
            db=db, id=node_id, new_obj=tmnt_update.tmnt_attr
        )

    if tmnt_update.tmnt_cost is not None:
        _ = await crud.tmnt_cost.upsert(
            db=db, id=node_id, new_obj=tmnt_update.tmnt_cost
        )

    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.node_id == node_id)
    )
    return result.scalars().first()


@router.get(
    "/",
    response_model=list[TMNTView],
    name="tmnt_facility_attr:get_all_tmnt_attr",
)
async def get_all_tmnt_attr(
    db: AsyncSessionDB,
    limit: int = Query(int(1e6)),
    offset: int = Query(0),
):
    result = await db.execute(select(tmnt.TMNT_View).offset(offset).limit(limit))
    return result.scalars().all()
