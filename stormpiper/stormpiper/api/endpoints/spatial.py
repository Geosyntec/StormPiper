from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse


import stormpiper.earth_engine as ee

router = APIRouter()


@router.get("/ee/elevation", response_class=JSONResponse, name="spatial.elevation")
async def get_elevation(
    long: float = Query(...), lat: float = Query(...)
) -> JSONResponse:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    return ee.get_elevation(long, lat)


@router.get("/ee/assets", response_class=JSONResponse)
async def get_ee_assets() -> JSONResponse:

    rsp = ee.assets()

    if not rsp:  # pragma: no cover
        raise HTTPException(status_code=404, detail=f"not found")

    return rsp
