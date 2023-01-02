from fastapi import APIRouter

from stormpiper.api.endpoints import (
    bg_worker,
    globals,
    npv,
    prom,
    reference,
    results,
    spatial,
    subbasin,
    table,
    tileserver,
    tmnt_attr,
    tmnt_delineation,
    tmnt_facility,
    tmnt_source_control,
    users,
)

api_router = APIRouter(prefix="/api/rest")
api_router.include_router(spatial.router, prefix="/spatial", tags=["spatial"])
api_router.include_router(subbasin.router, prefix="/subbasin", tags=["subbasin"])
api_router.include_router(table.router, prefix="/table", tags=["table"])
api_router.include_router(tileserver.router, prefix="/tileserver", tags=["spatial"])
api_router.include_router(
    tmnt_facility.router, prefix="/tmnt_facility", tags=["tmnt_facility"]
)
api_router.include_router(
    tmnt_delineation.router, prefix="/tmnt_delineation", tags=["tmnt_delineation"]
)
api_router.include_router(tmnt_attr.router, prefix="/tmnt_attr", tags=["tmnt_attr"])
api_router.include_router(
    tmnt_source_control.router,
    prefix="/tmnt_source_control",
    tags=["tmnt_source_control"],
)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reference.router, prefix="/reference", tags=["reference"])
api_router.include_router(
    results.router,
    prefix="/results",
    tags=["tmnt_facility", "results"],
)

api_router.include_router(bg_worker.router, prefix="/tasks", tags=["bg"])
api_router.include_router(globals.router, prefix="/global_setting", tags=["globals"])


rpc_router = APIRouter(prefix="/api/rpc")
rpc_router.include_router(bg_worker.rpc_router, tags=["bg"])
rpc_router.include_router(prom.rpc_router, tags=["subbasin", "promethee"])
rpc_router.include_router(npv.rpc_router, tags=["costs", "npv"])
