from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select

from stormpiper.apps.supersafe.users import check_readonly_token, user_role_ge_reader
from stormpiper.database.schemas.subbasin_result_view import (
    SubbasinInfo_View,
    SubbasinWQResult_View,
)
from stormpiper.database.utils import scalars_to_gdf_to_geojson
from stormpiper.models.result_view import Epoch, SubbasinInfoView, SubbasinWQResultView

from ..depends import AsyncSessionDB

router = APIRouter()


@router.get(
    "/wq/{subbasin_id}/token/{token}",
    response_model=SubbasinWQResultView,
    name="subbasin:get_subbasin_wq_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/wq/{subbasin_id}",
    response_model=SubbasinWQResultView,
    name="subbasin:get_subbasin_wq",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_subbasin_wq(
    subbasin_id: str,
    db: AsyncSessionDB,
    epoch: Epoch | None = Query("1980s"),
):
    q = select(SubbasinWQResult_View).where(
        SubbasinWQResult_View.subbasin == subbasin_id  # type: ignore
    )
    epoch = epoch or "1980s"  # type: ignore
    if epoch != "all":
        q = q.where(SubbasinWQResult_View.epoch == epoch)  # type: ignore
    result = await db.execute(q)
    scalar = result.scalars().first()

    if scalar is None:
        raise HTTPException(status_code=404, detail=f"not found: {subbasin_id}")

    return scalar


@router.get(
    "/wq/token/{token}",
    response_model=list[SubbasinWQResultView],
    name="subbasin:get_all_subbasins_wq_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/wq/",
    response_model=list[SubbasinWQResultView],
    name="subbasin:get_all_subbasins_wq",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_all_subbasins_wq(
    db: AsyncSessionDB,
    limit: int | None = Query(int(1e6)),
    offset: int | None = Query(0),
    epoch: Epoch | None = Query("1980s"),
):
    q = select(SubbasinWQResult_View)

    epoch = epoch or "1980s"  # type: ignore
    if epoch != "all":
        q = q.where(SubbasinWQResult_View.epoch == epoch)  # type: ignore

    q = q.offset(offset).limit(limit)

    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars


@router.get(
    "/{subbasin_id}/token/{token}",
    response_model=SubbasinInfoView,
    name="subbasin:get_subbasin_info_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/{subbasin_id}",
    response_model=SubbasinInfoView,
    name="subbasin:get_subbasin_info",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_subbasin_info(
    subbasin_id: str,
    db: AsyncSessionDB,
):
    q = select(SubbasinInfo_View).where(SubbasinInfo_View.subbasin == subbasin_id)  # type: ignore
    result = await db.execute(q)
    scalar = result.scalars().first()

    if scalar is None:
        raise HTTPException(status_code=404, detail=f"not found: {subbasin_id}")

    return scalar


@router.get(
    "/token/{token}",
    response_model=list[SubbasinInfoView],
    name="subbasin:get_all_subbasins_info_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/",
    response_model=list[SubbasinInfoView],
    name="subbasin:get_all_subbasins",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_all_subbasins_info(
    db: AsyncSessionDB,
    f: str | None = Query("json"),
    limit: int | None = Query(int(1e6)),
    offset: int | None = Query(0),
):
    q = select(SubbasinInfo_View).offset(offset).limit(limit)

    result = await db.execute(q)
    scalars = result.scalars().all()

    if f == "geojson" and scalars:
        # TODO: cache this server-side

        content = await run_in_threadpool(scalars_to_gdf_to_geojson, scalars)  # type: ignore

        return Response(
            content=content,
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars
