from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select

from stormpiper.apps.supersafe.users import check_readonly_token, user_role_ge_reader
from stormpiper.database.schemas import tmnt_view as tmnt
from stormpiper.database.utils import scalars_to_gdf_to_geojson
from stormpiper.models.tmnt_view import TMNTView

from ..depends import AsyncSessionDB

router = APIRouter()


@router.get(
    "/token/{token}",
    response_model=list[TMNTView],
    name="tmnt_facility:get_all_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/",
    response_model=list[TMNTView],
    name="tmnt_facility:get_all_tmnt",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_all_tmnt(
    db: AsyncSessionDB,
    f: str = Query("json"),
    limit: int | None = Query(int(1e6)),
    offset: int = Query(0),
):
    result = await db.execute(select(tmnt.TMNT_View).offset(offset).limit(limit))
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


@router.get(
    "/{node_id}/token/{token}",
    response_model=TMNTView,
    name="tmnt_facility:get_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/{node_id}",
    response_model=TMNTView,
    name="tmnt_facility:get_tmnt",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_tmnt(node_id: str, db: AsyncSessionDB):
    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.node_id == node_id)
    )
    scalar = result.scalars().first()

    if scalar is None:
        raise HTTPException(status_code=404, detail=f"id not found: {node_id}")

    return scalar
