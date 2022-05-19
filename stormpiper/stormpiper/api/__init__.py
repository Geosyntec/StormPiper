from fastapi import APIRouter

from stormpiper.api.endpoints import spatial
from stormpiper.api.endpoints import tileserver
from stormpiper.api.endpoints import users
from stormpiper.api.endpoints import bg_worker


api_router = APIRouter(prefix="/api/rest")
api_router.include_router(spatial.router, prefix="/spatial", tags=["spatial"])
api_router.include_router(tileserver.router, prefix="/tileserver", tags=["spatial"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(bg_worker.router, prefix="/tasks", tags=["bg"])


rpc_router = APIRouter(prefix="/api/rpc")
rpc_router.include_router(users.rpc_router, tags=["users"])
rpc_router.include_router(bg_worker.rpc_router, tags=["bg"])
