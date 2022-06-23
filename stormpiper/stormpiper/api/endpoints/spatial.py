from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Query

import stormpiper.earth_engine as ee

router = APIRouter()


@router.get("/ee/elevation", name="spatial.elevation")
async def get_elevation(
    long: float = Query(..., example=-121.756163642),
    lat: float = Query(..., example=46.85166326),
) -> Dict:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    return ee.get_elevation(long, lat)


@router.get("/ee/assets")
async def get_ee_assets() -> Dict[str, Any]:

    rsp = ee.assets()

    if not rsp:  # pragma: no cover
        raise HTTPException(status_code=404, detail=f"not found")

    return rsp
