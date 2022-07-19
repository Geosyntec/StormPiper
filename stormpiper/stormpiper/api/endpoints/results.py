from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.core.config import settings
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import results
from stormpiper.database.utils import scalars_to_gdf
from stormpiper.models.result_view import ResultView

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


@router.get("/{altid}", response_model=ResultView, name="results:get_result")
async def get_result(
    altid: str,
    db: AsyncSession = Depends(get_async_session),
):

    result = await db.execute(
        select(results.Result_View).where(results.Result_View.id == altid)
    )
    scalars = result.scalars().last()

    return scalars
