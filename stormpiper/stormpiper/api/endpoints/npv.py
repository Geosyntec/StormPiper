from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError

from stormpiper.apps.supersafe.users import user_role_ge_editor
from stormpiper.core.exceptions import RecordNotFound
from stormpiper.database import crud
from stormpiper.models.npv import PVRequest
from stormpiper.models.tmnt_attr import TMNTFacilityCost
from stormpiper.src.npv import calculate_pv_for_existing_tmnt_in_db, compute_bmp_pv

from ..depends import AsyncSessionDB

rpc_router = APIRouter(dependencies=[Depends(user_role_ge_editor)])


@rpc_router.post("/calculate_present_cost", tags=["rpc"])
async def calculate_npv(pv: PVRequest):
    cost_results = await run_in_threadpool(compute_bmp_pv, **pv.dict())
    return cost_results


@rpc_router.post(
    "/calculate_present_cost/{node_id}",
    response_model=TMNTFacilityCost,
    tags=["rpc"],
)
async def calculate_pv_for_existing_tmnt(
    node_id: str,
    db: AsyncSessionDB,
):
    """Calculates the net present value of an existing structural bmp facility

    implement refresh-all capability on frontend.
    """

    try:
        attr = await calculate_pv_for_existing_tmnt_in_db(db=db, node_id=node_id)

    except RecordNotFound as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    except ValidationError as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    return attr


@rpc_router.post("/refresh_pv_for_all_existing_tmnt", tags=["rpc"])
async def refresh_pv_for_all_existing_tmnt(db: AsyncSessionDB):
    """Calculates the net present value of an existing structural bmp facility"""

    raise DeprecationWarning(
        "this functionality should be supported by the frontend, not the backend."
    )

    attrs = await crud.tmnt_cost.get_all(db=db)
    if not attrs:
        raise HTTPException(status_code=404, detail=f"Records not found.")

    for attr in attrs:
        try:
            _ = await calculate_npv_for_existing_tmnt_in_db(db=db, node_id=attr.node_id)

        except RecordNotFound as e:
            raise HTTPException(status_code=404, detail=f"{e}")

        except ValidationError as e:
            raise HTTPException(status_code=404, detail=f"{e}")

    return "complete"
