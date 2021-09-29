from fastapi import APIRouter

from stormpiper.api.endpoints import spatial

api_router = APIRouter(prefix="/api")
api_router.include_router(spatial.router, tags=["spatial"])
