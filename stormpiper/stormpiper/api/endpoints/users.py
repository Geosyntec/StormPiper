from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import (
    User,
    check_admin,
    check_protect_role_field,
    get_async_session,
    fastapi_users,
)
from stormpiper.apps.supersafe import models
from stormpiper.apps.supersafe.init_users import create_admin, create_public


router = fastapi_users.get_users_router(models.UserRead, models.UserUpdate)
rpc_router = APIRouter()


class UserResponse(models.UserRead):
    class Config:
        orm_mode = True


# REST Routes


@router.get("/", response_model=List[UserResponse], name="users:get_users")
async def get_users(db: AsyncSession = Depends(get_async_session)):

    result = await db.execute(select(User))
    return result.scalars().all()


# RPC Routes


@rpc_router.get("/init_admin_user", tags=["admin"])
async def init_admin():
    await create_admin()


@rpc_router.get("/init_public_user", tags=["admin"])
async def init_public():
    await create_public()


# routes requiring admin role (i.e., role==100)
for r in router.routes:
    if r.name in [
        "users:patch_user",
        "users:delete_user",
        "users:user",
        "users:get_users",
    ]:
        r.dependencies.append(Depends(check_admin))


# Prevent non-admins from changing their role.
for r in router.routes:
    if r.name in [
        "users:patch_current_user",
    ]:
        r.dependencies.append(Depends(check_protect_role_field))
