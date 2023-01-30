from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.core.exceptions import RecordNotFound
from stormpiper.database.connection import get_async_session
from stormpiper.models.tmnt_cost import NPVRequest, TMNTFacilityCost
from stormpiper.src.npv import calculate_npv_for_existing_tmnt_in_db, compute_bmp_npv

rpc_router = APIRouter(dependencies=[Depends(check_user)])


@rpc_router.post("/calculate_net_present_value", tags=["rpc"])
async def calculate_npv(npv: NPVRequest):
    result, costs = compute_bmp_npv(**npv.dict())

    return {"net_present_value": result, "annual_costs": costs}


@rpc_router.get(
    "/calculate_net_present_value/{node_id}",
    response_model=TMNTFacilityCost,
    tags=["rpc"],
)
@rpc_router.post(
    "/calculate_net_present_value/{node_id}",
    response_model=TMNTFacilityCost,
    tags=["rpc"],
)
async def calculate_npv_for_existing_tmnt(
    node_id: str,
    db: AsyncSession = Depends(get_async_session),
):
    """Calculates the net present value of an existing structural bmp facility"""

    try:
        attr = await calculate_npv_for_existing_tmnt_in_db(db=db, node_id=node_id)

    except RecordNotFound as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    except ValidationError as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    return attr
