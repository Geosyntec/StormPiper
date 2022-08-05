from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from stormpiper.apps.supersafe.users import check_user
from stormpiper.core.context import get_context

router = APIRouter(dependencies=[Depends(check_user)])


@router.get("/context")
async def get_cxt(context=Depends(get_context)):
    return JSONResponse(content=context, headers={"Cache-Control": "max-age=86400"})
