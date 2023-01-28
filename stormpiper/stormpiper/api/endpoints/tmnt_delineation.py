from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import check_readonly_token, check_user
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas import tmnt
from stormpiper.database.utils import scalars_to_gdf_to_geojson
from stormpiper.models.tmnt_delineation import TMNTFacilityDelineation

router = APIRouter()


@router.get(
    "/{altid}/token/{token}",
    response_model=List[TMNTFacilityDelineation],
    name="tmnt_delineation:get_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/{altid}",
    response_model=List[TMNTFacilityDelineation],
    name="tmnt_delineation:get_tmnt",
    dependencies=[Depends(check_user)],
)
async def get_tmnt_delineations(
    altid: str,
    f: str = Query("json"),
    db: AsyncSession = Depends(get_async_session),
):
    """Returns a list because more than one delineation can be associated with a facility"""

    q = select(tmnt.TMNTFacilityDelineation).where(
        tmnt.TMNTFacilityDelineation.altid == altid
    )
    result = await db.execute(q)
    scalars = result.scalars().all()
    if f == "geojson":
        content = await run_in_threadpool(scalars_to_gdf_to_geojson, scalars)
        return Response(
            content=content,
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars


@router.get(
    "/token/{token}",
    response_model=List[TMNTFacilityDelineation],
    name="tmnt_delineation:get_all_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/",
    response_model=List[TMNTFacilityDelineation],
    name="tmnt_delineation:get_all_tmnt",
    dependencies=[Depends(check_user)],
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

        content = await run_in_threadpool(scalars_to_gdf_to_geojson, scalars)

        return Response(
            content=content,
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return scalars
