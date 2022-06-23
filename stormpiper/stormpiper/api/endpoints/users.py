from typing import List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe import models
from stormpiper.apps.supersafe.users import (
    User,
    check_admin,
    check_protect_role_field,
    fastapi_users,
    get_async_session,
)

router = fastapi_users.get_users_router(models.UserRead, models.UserUpdate)


class UserResponse(models.UserRead):
    class Config:
        orm_mode = True


@router.get("/", response_model=List[UserResponse], name="users:get_users")
async def get_users(db: AsyncSession = Depends(get_async_session)):

    result = await db.execute(select(User))
    return result.scalars().all()


# routes requiring admin role (i.e., role==100)
for r in router.routes:
    n = getattr(r, "name", None)
    deps = getattr(r, "dependencies", [])
    if n in [
        "users:patch_user",
        "users:delete_user",
        "users:user",
        "users:get_users",
    ]:
        deps.append(Depends(check_admin))


# Prevent non-admins from changing their role.
for r in router.routes:
    n = getattr(r, "name", None)
    deps = getattr(r, "dependencies", [])
    if n in [
        "users:patch_current_user",
    ]:
        deps.append(Depends(check_protect_role_field))
