from io import BytesIO
from typing import Dict

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse, StreamingResponse

from stormpiper.earth_engine import get_tile_registry
from stormpiper.apps.supersafe.users import check_user


router = APIRouter(dependencies=[Depends(check_user)])


@router.get("/redirect/{tilename}/{z}/{x}/{y}/{s}")
async def get_tile_zxy_redirect(
    tilename: str,
    z: int,
    x: int,
    y: int,
    s: str = "none",
    tile_registry: Dict = Depends(get_tile_registry),
) -> RedirectResponse:

    url = tile_registry.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

    if not url:
        raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

    return RedirectResponse(url)


@router.get("/{tilename}/{z}/{x}/{y}/{s}")
async def get_tile_file_zxy(
    request: Request,
    tilename: str,
    z: int,
    x: int,
    y: int,
    s: str = "a",
    tile_registry: Dict = Depends(get_tile_registry),
) -> StreamingResponse:

    url = tile_registry.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

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
