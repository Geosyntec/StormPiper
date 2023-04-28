from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select

from stormpiper.apps.supersafe.users import check_readonly_token, user_role_ge_reader
from stormpiper.database.schemas.subbasin_result_view import SubbasinResult_View
from stormpiper.database.utils import scalars_to_gdf_to_geojson
from stormpiper.models.result_view import Epoch, SubbasinResultView

from ..depends import AsyncSessionDB

router = APIRouter()


@router.get(
    "/{subbasin_id}/token/{token}",
    response_model=SubbasinResultView,
    name="subbasin:get_subbasin_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/{subbasin_id}",
    response_model=SubbasinResultView,
    name="subbasin:get_subbasin",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_subbasin(
    subbasin_id: str,
    db: AsyncSessionDB,
    epoch: Epoch | None = Query("1980s", example="1980s"),  # type: ignore
):
    q = select(SubbasinResult_View).where(SubbasinResult_View.subbasin == subbasin_id)
    epoch = epoch or "1980s"
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
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_all_subbasins(
    db: AsyncSessionDB,
    f: str | None = Query("json"),
    limit: int | None = Query(int(1e6)),
    offset: int | None = Query(0),
    epoch: Epoch | None = Query("1980s", example="1980s"),  # type: ignore
):
    q = select(SubbasinResult_View)

    epoch = epoch or "1980s"
    if epoch != "all":
        q = q.where(SubbasinResult_View.epoch == epoch)

    q = q.offset(offset).limit(limit)

    result = await db.execute(q)
    scalars = result.scalars().all()

    if f == "geojson" and scalars:
        # TODO: cache this server-side

        content = await run_in_threadpool(scalars_to_gdf_to_geojson, scalars)

        return Response(
            content=content,
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars
