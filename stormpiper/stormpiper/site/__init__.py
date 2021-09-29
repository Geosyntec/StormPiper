from fastapi import APIRouter

from stormpiper.site.views import tileserver

site_router = APIRouter()
site_router.include_router(tileserver.router)
