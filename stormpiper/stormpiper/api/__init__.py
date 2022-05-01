from fastapi import APIRouter

from stormpiper.api.endpoints import spatial
from stormpiper.api.endpoints import tileserver
from stormpiper.api.endpoints import users


api_router = APIRouter(prefix="/api/rest")
api_router.include_router(spatial.router, prefix="/spatial", tags=["spatial"])
api_router.include_router(tileserver.router, prefix="/tileserver", tags=["spatial"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

rpc_router = APIRouter(prefix="/api/rpc")
rpc_router.include_router(users.rpc_router, prefix="/users", tags=["users"])
