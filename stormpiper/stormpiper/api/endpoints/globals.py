from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from stormpiper.apps.supersafe.users import user_role_ge_user_admin
from stormpiper.database import crud
from stormpiper.database.schemas.globals import GlobalCostSetting, GlobalSetting
from stormpiper.models.globals import (
    GlobalSettingCreate,
    GlobalSettingPatch,
    GlobalSettingPost,
    GlobalSettingResponse,
    GlobalSettingUpdate,
)

from ..depends import AsyncSessionDB, UserAdmin

router = APIRouter(dependencies=[Depends(user_role_ge_user_admin)])


## Cost Global Settings


@router.get(
    "/cost/{variable}",
    response_model=GlobalSettingResponse,
    name="globals:get_global_cost",
)
async def get_cost_global(
    *,
    variable: str,
    db: AsyncSessionDB,
):
    attr = await crud.global_cost_setting.get(db=db, id=variable)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for variable={variable}"
        )

    return attr


@router.patch(
    "/cost/{variable}",
    response_model=GlobalSettingResponse,
    name="globals:patch_global_cost",
)
async def patch_cost_global(
    *,
    variable: str,
    setting: GlobalSettingPatch,
    db: AsyncSessionDB,
    user: UserAdmin,
):
    attr = await crud.global_cost_setting.get(db=db, id=variable)

    if not attr:  # pragma: no cover
        raise HTTPException(
            status_code=404, detail=f"Record not found for variable={variable}"
        )

    _setting = GlobalSettingUpdate.construct(
        **setting.dict(exclude_unset=True), updated_by=user.email
    )

    attr = await crud.global_cost_setting.update(db=db, id=variable, new_obj=_setting)

    return attr


@router.get(
    "/cost",
    name="globals:get_all_cost_globals",
    response_model=list[GlobalSettingResponse],
)
async def get_all_cost_globals(db: AsyncSessionDB):
    q = select(GlobalCostSetting)
    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars


@router.get(
    "/{variable}",
    response_model=GlobalSettingResponse,
    name="globals:get_global",
)
async def get_global(
    *,
    variable: str,
    db: AsyncSessionDB,
):
    attr = await crud.global_setting.get(db=db, id=variable)

    if not attr:
        raise HTTPException(
            status_code=404, detail=f"Record not found for variable={variable}"
        )

    return attr


@router.patch(
    "/{variable}",
    response_model=GlobalSettingResponse,
    name="globals:patch_global",
)
async def patch_global(
    *,
    variable: str,
    setting: GlobalSettingPatch,
    db: AsyncSessionDB,
    user: UserAdmin,
):
    attr = await crud.global_setting.get(db=db, id=variable)

    if not attr:  # pragma: no cover
        raise HTTPException(
            status_code=404, detail=f"Record not found for variable={variable}"
        )

    _setting = GlobalSettingUpdate.construct(
        **setting.dict(exclude_unset=True), updated_by=user.email
    )

    attr = await crud.global_setting.update(db=db, id=variable, new_obj=_setting)

    return attr


@router.post(
    "/",
    response_model=GlobalSettingResponse,
    name="globals:create_global_setting",
)
async def create_global_setting(
    *,
    setting: GlobalSettingPost,
    db: AsyncSessionDB,
    user: UserAdmin,
):
    new_obj = GlobalSettingCreate(
        **setting.dict(exclude_unset=True, exclude_none=True), updated_by=user.email
    )

    try:
        attr = await crud.global_setting.create(db=db, new_obj=new_obj)
    except Exception as e:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return attr


@router.delete(
    "/{variable}",
    status_code=status.HTTP_204_NO_CONTENT,
    name="globals:delete_global_setting",
)
async def delete_global_setting(
    variable: str,
    db: AsyncSessionDB,
):
    try:
        attr = await crud.global_setting.remove(db=db, id=variable)
    except Exception as e:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return None


@router.get(
    "/", name="globals:get_all_globals", response_model=list[GlobalSettingResponse]
)
async def get_all_globals(db: AsyncSessionDB):
    q = select(GlobalSetting)
    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars
