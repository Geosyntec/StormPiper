from copy import deepcopy
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Body, Depends, Path, Query, status
from fastapi.exceptions import HTTPException
from nereid.api.api_v1.models import treatment_facility_models
from nereid.api.api_v1.models.treatment_facility_models import (
    STRUCTURAL_FACILITY_TYPE,
    TREATMENT_FACILITY_MODELS,
)
from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps import supersafe as ss
from stormpiper.apps.supersafe.users import check_user
from stormpiper.core.context import get_context
from stormpiper.database import crud
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import tmnt
from stormpiper.models.base import BaseModel as Base
from stormpiper.models.npv import NPVRequest
from stormpiper.models.tmnt_attr import (
    TMNTFacilityAttr,
    TMNTFacilityAttrPatch,
    TMNTFacilityAttrUpdate,
)
from stormpiper.src.npv import compute_bmp_npv, get_npv_settings

router = APIRouter(dependencies=[Depends(check_user)])


@router.get(
    "/{altid}",
    response_model=TMNTFacilityAttr,
    name="tmnt_facility_attr:get_tmnt_attr",
)
async def get_tmnt_attr(
    altid: str,
    db: AsyncSession = Depends(get_async_session),
):
    attr = await crud.tmnt_attr.get(db=db, id=altid)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for altid={altid}"
        )

    return attr


def validate_tmnt_modeling_params(unvalidated_data: dict, context: dict) -> None:
    modeling_fields = {
        f
        for c in TREATMENT_FACILITY_MODELS
        for f in type("_", (Base, c), {}).get_fields()
    }

    modifies_modeling_data = any(
        (k in modeling_fields for k in unvalidated_data.keys())
    )

    if not modifies_modeling_data:
        return

    facility_type = unvalidated_data.get("facility_type", None)

    facility_type_context = context["api_recognize"]["treatment_facility"][
        "facility_type"
    ]
    model_str = facility_type_context.get(facility_type, {}).get(
        "validator", r"¯\_(ツ)_/¯"
    )
    model = getattr(treatment_facility_models, model_str, None)

    if model is None:
        e = (
            f"facility type '{facility_type}' is invalid. "
            f"Valid facility types are: {list(facility_type_context.keys())}"
        )
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e)
    md = dict(node_id="", ref_data_key="", design_storm_depth_inches=1)
    md.update(
        TMNTFacilityAttrPatch(**unvalidated_data).dict(
            exclude_unset=True, exclude_none=True
        )
    )
    try:
        _ = model(**md)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return


async def maybe_update_npv_params(
    unvalidated_data: dict, npv_global_settings: dict, db: AsyncSession
) -> dict[str, Any]:

    try:
        npv_req = NPVRequest(
            **unvalidated_data,
            **npv_global_settings,
        )

    except ValidationError as e:
        return unvalidated_data

    result, _ = compute_bmp_npv(**npv_req.dict())
    unvalidated_data["net_present_value"] = result

    return unvalidated_data


async def validate_facility_create_or_update(
    tmnt_attr: Union[
        Dict[str, Any], TMNTFacilityAttrPatch, STRUCTURAL_FACILITY_TYPE
    ] = Body(
        ...,
        example={
            "treatment_strategy": "string",
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
        },
    ),
    context: dict = Depends(get_context),
    db: AsyncSession = Depends(get_async_session),
) -> TMNTFacilityAttrUpdate:

    unvalidated_data = deepcopy(tmnt_attr)

    if isinstance(unvalidated_data, BaseModel):
        unvalidated_data = unvalidated_data.dict()

    validate_tmnt_modeling_params(unvalidated_data, context)

    npv_global_settings: Dict[str, float] = await get_npv_settings(db)
    unvalidated_data = await maybe_update_npv_params(
        unvalidated_data, npv_global_settings, db
    )

    return TMNTFacilityAttrUpdate(**unvalidated_data)


@router.patch(
    "/{altid}",
    response_model=TMNTFacilityAttr,
    name="tmnt_facility_attr:patch_tmnt_attr",
)
async def patch_tmnt_attr(
    *,
    altid: str = Path(..., example="SWFA-100002"),
    tmnt_attr: TMNTFacilityAttrUpdate = Depends(validate_facility_create_or_update),
    db: AsyncSession = Depends(get_async_session),
    user: ss.users.User = Depends(ss.users.current_active_user),
):
    attr = await crud.tmnt_attr.get(db=db, id=altid)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for altid={altid}"
        )

    tmnt_attr.updated_by = user.email

    attr = await crud.tmnt_attr.update(db=db, id=altid, new_obj=tmnt_attr)

    return attr


@router.get(
    "/",
    response_model=List[TMNTFacilityAttr],
    name="tmnt_facility_attr:get_all_tmnt_attr",
)
async def get_all_tmnt_attr(
    limit: Optional[int] = Query(int(1e6)),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_async_session),
):

    q = select(tmnt.TMNTFacilityAttr).offset(offset).limit(limit)
    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars
