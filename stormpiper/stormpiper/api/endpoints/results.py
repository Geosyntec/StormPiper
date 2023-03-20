from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import select

from stormpiper.apps.supersafe.users import user_role_ge_reader
from stormpiper.database.dependencies import async_is_dirty
from stormpiper.database.schemas import results
from stormpiper.models.result_view import Epoch, ResultView

from ..depends import AsyncSessionDB

router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@router.get("/", response_model=list[ResultView], name="results:get_all_results")
async def get_all_results(
    db: AsyncSessionDB,
    limit: None | int = Query(int(1e6)),
    offset: int = Query(0),
    epoch: Epoch = Query(Epoch.all, example="1980s"),  # type: ignore
):
    q = select(results.ResultBlob).offset(offset).limit(limit)
    if epoch != "all":
        q = q.where(results.ResultBlob.epoch == epoch)

    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars


@router.get("/is_dirty", name="results:get_result_is_dirty")
async def get_result_is_dirty(db: AsyncSessionDB):
    response = {"is_dirty": True, "last_updated": "0"}

    is_dirty, last_updated = await async_is_dirty(tablename="subbasin_result", db=db)

    response["is_dirty"] = is_dirty
    response["last_updated"] = last_updated

    return response


@router.get("/{node_id}", response_model=list[ResultView], name="results:get_result")
async def get_result(
    db: AsyncSessionDB,
    node_id: str = Path(..., title="node id or altid", example="SWFA-100002"),
    epoch: Epoch = Query(Epoch.all, example="1980s"),  # type: ignore
):
    q = select(results.ResultBlob).where(results.ResultBlob.node_id == node_id)

    if epoch != "all":
        q = q.where(results.ResultBlob.epoch == epoch)

    result = await db.execute(q)
    scalar = result.scalars().all()

    if not scalar:
        epoch_detail = f" and epoch={epoch}" if epoch else ""
        raise HTTPException(
            status_code=404, detail=f"not found: node_id={node_id}{epoch_detail}"
        )

    return scalar
