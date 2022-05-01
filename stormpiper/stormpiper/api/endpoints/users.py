from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import (
    UserTable,
    User,
    check_admin,
    get_async_session,
    fastapi_users,
)
from stormpiper.apps.supersafe.scripts.init_users import create_admin, create_public


router = fastapi_users.get_users_router()


class UserResponse(User):
    class Config:
        orm_mode = True


@router.get("/", response_model=List[UserResponse], name="users:get_users")
async def get_users(db: AsyncSession = Depends(get_async_session)):

    result = await db.execute(select(UserTable))
    return result.scalars().all()


for r in router.routes:
    if r.name in [
        "users:patch_user",
        "users:delete_user",
        "users:user",
        "users:get_users",
    ]:
        r.dependencies.append(Depends(check_admin))


rpc_router = APIRouter()


@rpc_router.get("/init_admin", tags=["admin"])
async def init_admin():
    await create_admin()


@rpc_router.get("/init_public", tags=["admin"])
async def init_public():
    await create_public()
