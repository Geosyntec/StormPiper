from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.engine.url import make_url

from stormpiper.apps.supersafe.users import check_user, check_admin
from stormpiper.core.config import settings
from stormpiper.core.context import get_context

router = APIRouter(dependencies=[Depends(check_user)])


@router.get("/context")
async def get_cxt(context=Depends(get_context)):
    return JSONResponse(content=context, headers={"Cache-Control": "max-age=86400"})


@router.get("/check_router", dependencies=[Depends(check_admin)], name="check_router")
async def get_check(request: Request):

    rsp = {
        "request.url": str(request.url),
        "scheme": str(request.scope["scheme"]),
        "request.url_for": request.url_for("check_router"),
        "request.scope['router'].url_path_for": request.scope["router"].url_path_for(
            "check_router"
        ),
        "database_url_async": repr(make_url(settings.DATABASE_URL_ASYNC)),
        "database_url_sync": repr(make_url(settings.DATABASE_URL_SYNC)),
    }

    return JSONResponse(content=rsp)
