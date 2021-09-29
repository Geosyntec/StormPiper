from io import BytesIO
from typing import Any

import ee
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from fastapi.responses import RedirectResponse, StreamingResponse

# from stormpiper.core.config import settings
from stormpiper.earth_engine import fetch_lidar_dsm_tile_url


TILE_REGISTRY = {}


def init_tile_registry():

    TILE_REGISTRY[
        "esri"
    ] = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    TILE_REGISTRY[
        "carto-db"
    ] = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"

    if "lidar_dsm" not in TILE_REGISTRY:
        TILE_REGISTRY["lidar_dsm"] = fetch_lidar_dsm_tile_url()


router = APIRouter(dependencies=[Depends(init_tile_registry)])


@router.get(
    "/tileserver/{tilename}/{z}/{x}/{y}/{s}",
)
async def get_tile_zxy(tilename: str, z: int, x: int, y: int, s: str = "none") -> Any:

    url = TILE_REGISTRY.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

    if not url:
        raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

    return RedirectResponse(url)


@router.get("/file_tileserver/{tilename}/{z}/{x}/{y}/{s}")
async def get_tile_zxy_file(
    request: Request,
    tilename: str,
    z: int,
    x: int,
    y: int,
    s: str = "a",
) -> Any:

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


@router.get("/elevation")
async def get_elevation(long: float = Query(...), lat: float = Query(...)) -> Any:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    point = ee.Geometry.Point([long, lat])
    img = ee.Image("USGS/NED")
    elevation_meters = img.reduceRegion(ee.Reducer.first(), point)

    return elevation_meters.getInfo()
