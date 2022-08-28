import re
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from stormpiper.apps.supersafe.users import check_user, check_admin
from stormpiper.core.context import get_context

router = APIRouter(dependencies=[Depends(check_user)])


@router.get("/context")
async def get_cxt(context=Depends(get_context)):
    return JSONResponse(content=context, headers={"Cache-Control": "max-age=86400"})


@router.get("/check_router", dependencies=[Depends(check_admin)], name="check_router")
async def get_check(request: Request, context=Depends(get_context)):

    rsp = {
        "request.url": str(request.url),
        "request.scope.keys()": list(map(str, request.scope.keys())),
        "scheme": str(request.scope["scheme"]),
        "root_path": str(request.scope["root_path"]),
        "path": str(request.scope["path"]),
        "raw_path": str(request.scope["raw_path"]),
        "request.url_for": request.url_for("check_router"),
        "request.scope['router'].url_path_for": request.scope["router"].url_path_for(
            "check_router"
        ),
    }

    return JSONResponse(content=rsp)
