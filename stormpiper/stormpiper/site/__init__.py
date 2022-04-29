from fastapi import APIRouter

from stormpiper.site.views import demo

site_router = APIRouter()
site_router.include_router(demo.router)
