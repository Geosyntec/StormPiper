from io import BytesIO
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse, StreamingResponse

router = APIRouter()

TILE_REGISTRY = {
    "esri": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    "carto-db": "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
}


@router.get("/tileserver/{tilename}/{z}/{x}/{y}/{s}")
async def get_tile_zxy(
    tilename: str, z: float, x: float, y: float, s: str = "none"
) -> Any:

    url = TILE_REGISTRY.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

    if not url:
        raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

    return RedirectResponse(url)


@router.get("/file_tileserver/{tilename}/{z}/{x}/{y}/{s}")
async def get_tile_zxy_file(
    request: Request,
    tilename: str,
    z: float,
    x: float,
    y: float,
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
