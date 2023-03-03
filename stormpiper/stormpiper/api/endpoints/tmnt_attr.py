from typing import Any, List

from fastapi import APIRouter, Body, Depends, Path, Query, status
from fastapi.exceptions import HTTPException
from nereid.api.api_v1.models.treatment_facility_models import STRUCTURAL_FACILITY_TYPE
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps import supersafe as ss
from stormpiper.apps.supersafe.users import user_role_ge_editor
from stormpiper.core.context import get_context
from stormpiper.database import crud
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import tmnt_view as tmnt
from stormpiper.models.tmnt_attr import TMNTFacilityPatch, TMNTUpdate
from stormpiper.models.tmnt_attr_validator import tmnt_attr_validator
from stormpiper.models.tmnt_view import TMNTView

router = APIRouter(dependencies=[Depends(user_role_ge_editor)])


@router.get(
    "/{node_id}",
    response_model=TMNTView,
    name="tmnt_facility_attr:get_tmnt_attr",
)
async def get_tmnt_attr(
    node_id: str,
    db: AsyncSession = Depends(get_async_session),
):
    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.node_id == node_id)
    )

    if not result:
        raise HTTPException(
            status_code=404, detail=f"Record not found for node_id={node_id}"
        )

    return result.scalars().first()


async def validate_tmnt_update(
    tmnt_patch: dict[str, Any]
    | TMNTFacilityPatch
    | STRUCTURAL_FACILITY_TYPE = Body(
        ...,
        example={  # example required since default example is empty dict
            "facility_type": "string",
            "hsg": "string",
            "design_storm_depth_inches": 0,
            "tributary_area_tc_min": 0,
            "total_volume_cuft": 0,
            "area_sqft": 0,
            "inf_rate_inhr": 0,
            "retention_volume_cuft": 0,
            "media_filtration_rate_inhr": 0,
            "minimum_retention_pct_override": 0,
            "treatment_rate_cfs": 0,
            "depth_ft": 0,
            "captured_pct": 0,
            "retained_pct": 0,
            "capital_cost": 0,
            "om_cost_per_yr": 0,
            "lifespan_yrs": 0,
            "replacement_cost": 0,
        },
    ),
    context: dict = Depends(get_context),
    db: AsyncSession = Depends(get_async_session),
    user: ss.users.User = Depends(ss.users.current_active_user),
) -> TMNTUpdate:
    if isinstance(tmnt_patch, BaseModel):
        tmnt_patch = tmnt_patch.dict(exclude_unset=True)
    tmnt_patch["updated_by"] = user.email

    try:
        return await tmnt_attr_validator(tmnt_patch=tmnt_patch, context=context, db=db)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )


@router.patch(
    "/{node_id}",
    response_model=TMNTView,
    name="tmnt_facility_attr:patch_tmnt_attr",
)
async def patch_tmnt_attr(
    *,
    node_id: str = Path(..., example="SWFA-100002"),
    tmnt_update: TMNTUpdate = Depends(validate_tmnt_update),
    db: AsyncSession = Depends(get_async_session),
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
    response_model=List[TMNTView],
    name="tmnt_facility_attr:get_all_tmnt_attr",
)
async def get_all_tmnt_attr(
    limit: int = Query(int(1e6)),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_async_session),
):
    result = await db.execute(select(tmnt.TMNT_View).offset(offset).limit(limit))
    return result.scalars().all()
