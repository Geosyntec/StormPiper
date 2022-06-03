from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import subbasin
from stormpiper.database.utils import scalars_to_records, scalar_records_to_gdf
from stormpiper.core.config import settings
from stormpiper.models.base import BaseModel


router = APIRouter()


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

    result = await db.execute(select(subbasin.Subbasin).offset(offset).limit(limit))
    scalars = result.scalars().all()

    if f == "geojson":
        records = scalars_to_records(scalars)
        gdf = scalar_records_to_gdf(
            records, crs=settings.TACOMA_EPSG, geometry="geom"
        ).to_crs(epsg=4326)
        return Response(
            content=gdf.to_json(),
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars


@router.get(
    "/{subbasin_id}",
    response_model=List[SubbasinResponse],
    name="subbasin:get_subbasin",
)
async def get_subbasin(
    subbasin_id: str,
    db: AsyncSession = Depends(get_async_session),
):

    result = await db.execute(
        select(subbasin.Subbasin).where(subbasin.Subbasin.subbasin == subbasin_id)
    )

    scalars = result.scalars().first()

    return scalars
