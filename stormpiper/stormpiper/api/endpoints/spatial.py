from io import BytesIO
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse, RedirectResponse, StreamingResponse

from starlette.datastructures import URL

from stormpiper import earth_engine

router = APIRouter()


# @router.get("/tileserver_redirect/{tilename}/{z}/{x}/{y}/{s}")
# async def get_tile_zxy_redirect(
#     tilename: str, z: int, x: int, y: int, s: str = "none"
# ) -> RedirectResponse:

#     tile_registry = earth_engine.get_tile_registry()
#     url = tile_registry.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

#     if not url:
#         raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

#     return RedirectResponse(url)


# @router.get("/tileserver/{tilename}/{z}/{x}/{y}/{s}")
# async def get_tile_file_zxy(
#     request: Request,
#     tilename: str,
#     z: int,
#     x: int,
#     y: int,
#     s: str = "a",
# ) -> StreamingResponse:

#     tile_registry = earth_engine.get_tile_registry()
#     url = tile_registry.get(tilename, "").format(**dict(x=x, y=y, z=z, s=s))

#     if not url:
#         raise HTTPException(status_code=404, detail=f"tile {tilename} not found")

#     tileserver_session = request.app.sessions["tileserver_session"]

#     async with tileserver_session.get(url) as response:
#         media_type = response.headers["content-type"]
#         content = await response.read()

#     return StreamingResponse(
#         BytesIO(content),
#         media_type=media_type,
#         headers={"Connection": "keep-alive", "Cache-Control": "max-age=86400"},
#     )


@router.get("/ee/elevation", response_class=JSONResponse, name="spatial.elevation")
async def get_elevation(
    long: float = Query(...), lat: float = Query(...)
) -> JSONResponse:
    """mt_rainer = [-121.756163642, 46.85166326]"""

    return earth_engine.get_elevation(long, lat)


@router.get("/ee/assets", response_class=JSONResponse)
async def get_ee_assets() -> JSONResponse:

    rsp = earth_engine.assets()

    if not rsp:  # pragma: no cover
        raise HTTPException(status_code=404, detail=f"not found")

    return rsp
