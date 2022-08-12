from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.core.config import settings
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import subbasin
from stormpiper.database.utils import scalars_to_gdf
from stormpiper.models.base import BaseModel

router = APIRouter(dependencies=[Depends(check_user)])


class SubbasinResponse(BaseModel):
    basinname: str
    subbasin: str

    class Config:
        orm_mode = True


@router.get(
    "/",
    response_model=List[SubbasinResponse],
    name="subbasin:get_all_subbasins",
)
async def get_all_subbasins(
    f: str = Query("json"),
    limit: Optional[int] = Query(int(1e6)),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_async_session),
):

    q = select(subbasin.Subbasin).offset(offset).limit(limit)
    result = await db.execute(q)
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


@router.get(
    "/{subbasin_id}",
    response_model=SubbasinResponse,
    name="subbasin:get_subbasin",
)
async def get_subbasin(
    subbasin_id: str,
    db: AsyncSession = Depends(get_async_session),
):

    q = select(subbasin.Subbasin).where(subbasin.Subbasin.subbasin == subbasin_id)
    result = await db.execute(q)
    scalar = result.scalars().first()

    if scalar is None:
        raise HTTPException(status_code=404, detail=f"not found: {subbasin_id}")

    return scalar
