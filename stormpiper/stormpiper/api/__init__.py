from fastapi import APIRouter

from stormpiper.api.endpoints import (
    bg_worker,
    reference,
    results,
    spatial,
    subbasin,
    tileserver,
    tmnt_attr,
    tmnt_delineation,
    tmnt_facility,
    users,
)

api_router = APIRouter(prefix="/api/rest")
api_router.include_router(spatial.router, prefix="/spatial", tags=["spatial"])
api_router.include_router(subbasin.router, prefix="/subbasin", tags=["subbasin"])
api_router.include_router(tileserver.router, prefix="/tileserver", tags=["spatial"])
api_router.include_router(
    tmnt_facility.router, prefix="/tmnt_facility", tags=["tmnt_facility"]
)
api_router.include_router(
    tmnt_delineation.router, prefix="/tmnt_delineation", tags=["tmnt_delineation"]
)
api_router.include_router(tmnt_attr.router, prefix="/tmnt_attr", tags=["tmnt_attr"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reference.router, prefix="/reference", tags=["reference"])
api_router.include_router(
    results.router, prefix="/results", tags=["tmnt_facility", "results"]
)

api_router.include_router(bg_worker.router, prefix="/tasks", tags=["bg"])


rpc_router = APIRouter(prefix="/api/rpc")
rpc_router.include_router(bg_worker.rpc_router, tags=["bg"])
