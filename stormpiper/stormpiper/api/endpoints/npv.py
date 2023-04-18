from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from stormpiper.apps.supersafe.users import user_role_ge_editor
from stormpiper.core.exceptions import RecordNotFound
from stormpiper.database import crud
from stormpiper.models.npv import NPVRequest
from stormpiper.models.tmnt_attr import TMNTFacilityCost
from stormpiper.src.npv import calculate_npv_for_existing_tmnt_in_db, compute_bmp_npv

from ..depends import AsyncSessionDB

rpc_router = APIRouter(dependencies=[Depends(user_role_ge_editor)])


@rpc_router.post("/calculate_net_present_value", tags=["rpc"])
async def calculate_npv(npv: NPVRequest):
    result, costs = compute_bmp_npv(**npv.dict())

    return {"net_present_value": result, "annual_costs": costs}


@rpc_router.post(
    "/calculate_net_present_value/{node_id}",
    response_model=TMNTFacilityCost,
    tags=["rpc"],
)
async def calculate_npv_for_existing_tmnt(
    node_id: str,
    db: AsyncSessionDB,
):
    """Calculates the net present value of an existing structural bmp facility

    implement refresh-all capability on frontend.
    """

    try:
        attr = await calculate_npv_for_existing_tmnt_in_db(db=db, node_id=node_id)

    except RecordNotFound as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    except ValidationError as e:
        raise HTTPException(status_code=404, detail=f"{e}")

    return attr


@rpc_router.post("/refresh_npv_for_all_existing_tmnt", tags=["rpc"])
async def refresh_npv_for_all_existing_tmnt(db: AsyncSessionDB):
    """Calculates the net present value of an existing structural bmp facility"""

    attrs = await crud.tmnt_cost.get_all(db=db)
    if not attrs:
        raise HTTPException(status_code=404, detail=f"Records not found.")

    for attr in attrs:
        try:
            _ = await calculate_pv_for_existing_tmnt_in_db(db=db, node_id=attr.node_id)

        except RecordNotFound as e:
            raise HTTPException(status_code=404, detail=f"{e}")

        except ValidationError as e:
            raise HTTPException(status_code=404, detail=f"{e}")

    return dict(
        status="success",
        result="complete",
        detail=(
            "Present value successfully recalculated for all "
            "treatment facilities in the database."
        ),
    )
