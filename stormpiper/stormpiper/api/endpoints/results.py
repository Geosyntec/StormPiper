from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import select

from stormpiper.apps.supersafe.users import check_readonly_token, user_role_ge_reader
from stormpiper.database.dependencies import async_is_dirty
from stormpiper.database.schemas import results
from stormpiper.models.result_view import Epoch, NType, ResultView

from ..depends import AsyncSessionDB

router = APIRouter()


@router.get(
    "/token/{token}",
    response_model=list[ResultView],
    name="tmnt_delineation:get_all_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/",
    response_model=list[ResultView],
    name="results:get_all_results",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_all_results(
    db: AsyncSessionDB,
    ntype: NType | None = None,
    limit: int | None = Query(int(1e6)),
    offset: int | None = Query(0),
    epoch: Epoch | None = Query("1980s"),
):
    q = select(results.ResultBlob)

    epoch = epoch or "1980s"  # type: ignore
    if epoch != "all":
        q = q.where(results.ResultBlob.epoch == epoch)  # type: ignore
    if ntype is not None:
        q = q.where(results.ResultBlob.ntype == ntype)  # type: ignore

    q = q.offset(offset).limit(limit)

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


@router.get(
    "/{node_id}/token/{token}",
    response_model=list[ResultView],
    name="tmnt_delineation:get_all_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/{node_id}",
    response_model=list[ResultView],
    name="results:get_result",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_result(
    db: AsyncSessionDB,
    node_id: str = Path(
        ...,
        title="node id or altid",
        openapi_examples={"t": {"summary": "t", "value": "SWFA-100002"}},
    ),
    epoch: Epoch | None = Query("1980s"),
):
    q = select(results.ResultBlob).where(results.ResultBlob.node_id == node_id)  # type: ignore

    epoch = epoch or "1980s"  # type: ignore
    if epoch != "all":
        q = q.where(results.ResultBlob.epoch == epoch)  # type: ignore

    result = await db.execute(q)
    scalar = result.scalars().all()

    if not scalar:
        epoch_detail = f" and epoch={epoch}" if epoch else ""
        raise HTTPException(
            status_code=404, detail=f"not found: node_id={node_id}{epoch_detail}"
        )

    return scalar
