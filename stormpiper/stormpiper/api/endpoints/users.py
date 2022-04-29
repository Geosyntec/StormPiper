from typing import List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import (
    UserTable,
    User,
    check_admin,
    get_async_session,
    fastapi_users,
)

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
