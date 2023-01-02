from typing import Any, Dict, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.database import crud
from stormpiper.database.connection import get_async_session
from stormpiper.database.utils import orm_to_dict
from stormpiper.models.npv import NPVRequest
from stormpiper.models.tmnt_attr import TMNTFacilityAttr
from stormpiper.src.npv import compute_bmp_npv, get_npv_settings

rpc_router = APIRouter(dependencies=[Depends(check_user)])


@rpc_router.post("/calculate_net_present_value", tags=["rpc"])
async def calculate_npv(npv: NPVRequest):

    result, costs = compute_bmp_npv(**npv.dict())

    return {"net_present_value": result, "annual_costs": costs}


@rpc_router.get(
    "/calculate_net_present_value/{altid}",
    response_model=Union[Any, TMNTFacilityAttr],
    tags=["rpc"],
)
@rpc_router.post(
    "/calculate_net_present_value/{altid}",
    response_model=Union[Any, TMNTFacilityAttr],
    tags=["rpc"],
)
async def calculate_npv_for_existing_tmnt(
    altid: str,
    db: AsyncSession = Depends(get_async_session),
):
    """Calculates the net present value of a structural bmp facility"""

    attr = await crud.tmnt_attr.get(db=db, id=altid)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for altid={altid}"
        )

    npv_global_settings: Dict[str, float] = await get_npv_settings(db)

    try:
        npv_req = NPVRequest(
            **orm_to_dict(attr),
            **npv_global_settings,
        )

    except ValidationError as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    result, _ = compute_bmp_npv(**npv_req.dict())

    attr = await crud.tmnt_attr.update(
        db=db, id=altid, new_obj={"net_present_value": result}
    )

    return attr
