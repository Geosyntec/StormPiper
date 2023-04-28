from fastapi import APIRouter, Depends, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select

from stormpiper.apps.supersafe.users import check_readonly_token, user_role_ge_reader
from stormpiper.database.schemas import tmnt
from stormpiper.database.utils import scalars_to_gdf_to_geojson
from stormpiper.models.tmnt_delineation import TMNTFacilityDelineation

from ..depends import AsyncSessionDB

router = APIRouter()


@router.get(
    "/{altid}/token/{token}",
    response_model=TMNTFacilityDelineation,
    name="tmnt_delineation:get_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/{altid}",
    response_model=TMNTFacilityDelineation,
    name="tmnt_delineation:get_tmnt",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_tmnt_delineations(
    db: AsyncSessionDB,
    altid: str,
    f: str = Query("json"),
):
    """Returns a list because more than one delineation can be associated with a facility"""

    q = select(tmnt.TMNTFacilityDelineation).where(
        tmnt.TMNTFacilityDelineation.altid == altid
    )
    result = await db.execute(q)

    if f == "geojson":
        content = await run_in_threadpool(
            scalars_to_gdf_to_geojson, result.scalars().all()
        )
        return Response(
            content=content,
            media_type="application/json",
            headers={"Cache-Control": "max-age=86400"},
        )

    return result.scalars().first()


@router.get(
    "/token/{token}",
    response_model=list[TMNTFacilityDelineation],
    name="tmnt_delineation:get_all_tmnt_via_token",
    dependencies=[Depends(check_readonly_token)],
)
@router.get(
    "/",
    response_model=list[TMNTFacilityDelineation],
    name="tmnt_delineation:get_all_tmnt",
    dependencies=[Depends(user_role_ge_reader)],
)
async def get_all_tmnt_delineations(
    db: AsyncSessionDB,
    f: str = Query("json"),
    limit: int | None = Query(int(1e6)),
    offset: int = Query(0),
    altid: str | None = None,
    relid: str | None = None,
):
    q = select(tmnt.TMNTFacilityDelineation).offset(offset).limit(limit)
    if altid is not None:
        q = q.where(tmnt.TMNTFacilityDelineation.altid == altid)
    if relid is not None:
        q = q.where(tmnt.TMNTFacilityDelineation.relid == relid)
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
