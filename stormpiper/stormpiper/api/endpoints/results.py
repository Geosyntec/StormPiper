from typing import List, Optional

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import results
from stormpiper.models.result_view import ResultView
from stormpiper.src.results import is_dirty

router = APIRouter(dependencies=[Depends(check_user)])


@router.get("/", response_model=List[ResultView], name="results:get_all_results")
async def get_all_results(
    limit: Optional[int] = Query(int(1e6)),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_async_session),
):

    result = await db.execute(select(results.Result_View).offset(offset).limit(limit))
    scalars = result.scalars().all()

    return scalars


@router.get("/is_dirty", name="results:get_result_is_dirty")
async def get_result_is_dirty(db: AsyncSession = Depends(get_async_session)):

    return await is_dirty(db=db)


@router.get("/{node_id}", response_model=List[ResultView], name="results:get_result")
async def get_result(
    node_id: str = Path(..., title="node id or altid", example="SWFA-100002"),
    epoch: str = Query(None, example="1980s"),
    db: AsyncSession = Depends(get_async_session),
):

    q = select(results.Result_View).where(results.Result_View.id == node_id)

    if epoch is not None:
        q = q.where(results.Result_View.epoch_id == epoch)

    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars
