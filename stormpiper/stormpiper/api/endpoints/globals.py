from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps import supersafe as ss
from stormpiper.apps.supersafe.users import check_user_admin
from stormpiper.database import crud
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas.globals import GlobalSetting
from stormpiper.models.globals import (
    GlobalSettingCreate,
    GlobalSettingPatch,
    GlobalSettingPost,
    GlobalSettingResponse,
    GlobalSettingUpdate,
)

router = APIRouter(dependencies=[Depends(check_user_admin)])


@router.get(
    "/{variable}",
    response_model=GlobalSettingResponse,
    name="globals:get_global",
)
async def get_global(
    *,
    variable: str,
    db: AsyncSession = Depends(get_async_session),
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
    db: AsyncSession = Depends(get_async_session),
    user: ss.users.User = Depends(ss.users.current_active_user),
):
    attr = await crud.global_setting.get(db=db, id=variable)

    if not attr:
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
    db: AsyncSession = Depends(get_async_session),
    user: ss.users.User = Depends(ss.users.current_active_user),
):

    new_obj = GlobalSettingCreate(
        **setting.dict(exclude_unset=True, exclude_none=True), updated_by=user.email
    )

    try:
        attr = await crud.global_setting.create(db=db, new_obj=new_obj)
    except Exception as e:
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
    db: AsyncSession = Depends(get_async_session),
):
    try:
        attr = await crud.global_setting.remove(db=db, id=variable)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e).replace("\n", " "),
        )

    return attr


@router.get(
    "/", name="globals:get_all_globals", response_model=List[GlobalSettingResponse]
)
async def get_all_globals(db: AsyncSession = Depends(get_async_session)):
    q = select(GlobalSetting)
    result = await db.execute(q)
    scalars = result.scalars().all()

    return scalars
