from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool

import stormpiper.earth_engine as ee

router = APIRouter()


async def _login_ee():
    await ee.async_login()
    return


@router.get(
    "/ee/elevation", name="spatial.elevation", dependencies=[Depends(_login_ee)]
)
async def get_elevation(
    long: float = Query(..., example=-121.756163642),
    lat: float = Query(..., example=46.85166326),
) -> dict:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    return await run_in_threadpool(ee.get_elevation, long=long, lat=lat)


@router.get("/ee/assets", dependencies=[Depends(_login_ee)])
async def get_ee_assets() -> dict[str, Any]:  # pragma: no cover
    rsp = await run_in_threadpool(ee.assets)

    if not rsp:  # pragma: no cover
        raise HTTPException(status_code=404, detail=f"not found")

    return rsp
