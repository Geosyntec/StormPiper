from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_user
from stormpiper.core import utils
from stormpiper.core.config import settings
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import tmnt
from stormpiper.database.utils import scalar_records_to_gdf, scalars_to_records
from stormpiper.models.tmnt_delineation import TMNTFacilityDelineation

router = APIRouter(dependencies=[Depends(check_user)])


@router.get(
    "/",
    response_model=List[TMNTFacilityDelineation],
    name="tmnt_delineation:get_all_tmnt",
)
async def get_all_tmnt_delineations(
    f: str = Query("json"),
    limit: Optional[int] = Query(int(1e6)),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_async_session),
):

    q = select(tmnt.TMNTFacilityDelineation).offset(offset).limit(limit)
    result = await db.execute(q)
    scalars = result.scalars().all()

    if f == "geojson":
        # TODO: cache this server-side
        records = scalars_to_records(scalars)
        gdf = scalar_records_to_gdf(
            records, crs=settings.TACOMA_EPSG, geometry="geom"
        ).to_crs(epsg=4326)
        if not gdf:
            return
        gdf = utils.datetime_to_isoformat(gdf)
        return Response(
            content=gdf.to_json(),
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars


@router.get(
    "/{altid}",
    response_model=List[TMNTFacilityDelineation],
    name="tmnt_delineation:get_tmnt",
)
async def get_tmnt_delineations(
    altid: str,
    db: AsyncSession = Depends(get_async_session),
):

    q = select(tmnt.TMNTFacilityDelineation).where(
        tmnt.TMNTFacilityDelineation.altid == altid
    )
    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars