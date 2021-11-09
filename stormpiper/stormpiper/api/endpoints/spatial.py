from io import BytesIO
from typing import Dict

import ee
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse, RedirectResponse, StreamingResponse

from stormpiper import earth_engine

TILE_REGISTRY: Dict[str, str] = {}


def init_tile_registry():

    global TILE_REGISTRY

    if not TILE_REGISTRY:

        TILE_REGISTRY[
            "esri"
        ] = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        TILE_REGISTRY[
            "carto-db"
        ] = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"

        layers = earth_engine.layers().values()

        for spec in layers:

            name = spec.get("safe_name")
            url = spec.get("layer", {}).get("url")
            if name and url:  # pragma: no branch
                TILE_REGISTRY[name] = url

    return TILE_REGISTRY


router = APIRouter()


@router.get(
    "/tileserver_redirect/{tilename}/{z}/{x}/{y}/{s}",
    dependencies=[Depends(init_tile_registry)],
)
async def get_tile_zxy_redirect(
    tilename: str, z: int, x: int, y: int, s: str = "none"
) -> RedirectResponse:

    url = TILE_REGISTRY.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

    if not url:
        raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

    return RedirectResponse(url)


@router.get(
    "/tileserver/{tilename}/{z}/{x}/{y}/{s}",
    dependencies=[Depends(init_tile_registry)],
)
async def get_tile_file_zxy(
    request: Request,
    tilename: str,
    z: int,
    x: int,
    y: int,
    s: str = "a",
) -> StreamingResponse:

    url = TILE_REGISTRY.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

    if not url:
        raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

    tileserver_session = request.app.sessions["tileserver_session"]

    async with tileserver_session.get(url) as response:
        media_type = response.headers["content-type"]
        content = await response.read()

    return StreamingResponse(
        BytesIO(content),
        media_type=media_type,
        headers={"Connection": "keep-alive", "Cache-Control": "max-age=86400"},
    )


@router.get("/elevation", response_class=JSONResponse)
async def get_elevation(
    long: float = Query(...), lat: float = Query(...)
) -> JSONResponse:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    point = ee.Geometry.Point([long, lat])
    img = ee.Image("USGS/NED")
    elevation_meters = img.reduceRegion(ee.Reducer.first(), point)

    return elevation_meters.getInfo()


@router.get("/spatial/assets", response_class=JSONResponse)
async def get_ee_assets() -> JSONResponse:

    rsp = earth_engine.assets()

    if not rsp:  # pragma: no cover
        raise HTTPException(status_code=404, detail=f"not found")

    return rsp
