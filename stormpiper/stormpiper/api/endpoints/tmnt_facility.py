from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.core.config import settings
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import tmnt
from stormpiper.database.utils import scalars_to_gdf
from stormpiper.models.tmnt_view import TMNTView

router = APIRouter(dependencies=[Depends(check_user)])


@router.get("/", response_model=List[TMNTView], name="tmnt_facility:get_all_tmnt")
async def get_all_tmnt(
    f: str = Query("json"),
    limit: Optional[int] = Query(int(1e6)),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_async_session),
):

    result = await db.execute(select(tmnt.TMNT_View).offset(offset).limit(limit))
    scalars = result.scalars().all()

    if f == "geojson":
        # TODO: cache this server-side
        gdf = scalars_to_gdf(scalars, crs=settings.TACOMA_EPSG, geometry="geom")
        gdf.to_crs(epsg=4326, inplace=True)

        return Response(
            content=gdf.to_json(),
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars


@router.get("/{altid}", response_model=TMNTView, name="tmnt_facility:get_tmnt")
async def get_tmnt(
    altid: str,
    db: AsyncSession = Depends(get_async_session),
):

    result = await db.execute(
        select(tmnt.TMNT_View).where(tmnt.TMNT_View.altid == altid)
    )
    scalar = result.scalars().first()

    if scalar is None:
        raise HTTPException(status_code=404, detail=f"not found: {altid}")

    return scalar
