from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_readonly_token, user_role_ge_editor
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas.subbasin_result_view import SubbasinResult_View
from stormpiper.database.utils import scalars_to_gdf_to_geojson
from stormpiper.models.result_view import Epoch, SubbasinResultView

router = APIRouter()


@router.get(
    "/{subbasin_id}",
    response_model=SubbasinResultView,
    name="subbasin:get_subbasin",
    dependencies=[Depends(user_role_ge_editor)],
)
async def get_subbasin(
    subbasin_id: str,
    epoch: Epoch = Query(Epoch.all, example="1980s"),  # type: ignore
    db: AsyncSession = Depends(get_async_session),
):
    q = select(SubbasinResult_View).where(SubbasinResult_View.subbasin == subbasin_id)
    if epoch != "all":
        q = q.where(SubbasinResult_View.epoch == epoch)
    result = await db.execute(q)
    scalar = result.scalars().first()

    if scalar is None:
        raise HTTPException(status_code=404, detail=f"not found: {subbasin_id}")

    return scalar


@router.get(
    "/token/{token}",
    response_model=list[SubbasinResultView],
    name="subbasin:get_all_subbasins_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/",
    response_model=list[SubbasinResultView],
    name="subbasin:get_all_subbasins",
    dependencies=[Depends(user_role_ge_editor)],
)
async def get_all_subbasins(
    f: str = Query("json"),
    limit: None | int = Query(int(1e6)),
    offset: int = Query(0),
    epoch: Epoch = Query(Epoch.all, example="1980s"),  # type: ignore
    db: AsyncSession = Depends(get_async_session),
):
    q = select(SubbasinResult_View).offset(offset).limit(limit)
    if epoch != "all":
        q = q.where(SubbasinResult_View.epoch == epoch)
    result = await db.execute(q)
    scalars = result.scalars().all()

    if f == "geojson":
        # TODO: cache this server-side

        content = await run_in_threadpool(scalars_to_gdf_to_geojson, scalars)

        return Response(
            content=content,
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars
