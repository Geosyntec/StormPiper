from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe import models
from stormpiper.apps.supersafe.users import (
    User,
    check_protect_role_field,
    check_reader,
    check_user_admin,
    current_active_user,
    fastapi_users,
    get_async_session,
    get_user_db,
)


class UserResponse(models.UserRead):
    class Config:
        orm_mode = True


router = APIRouter()

from uuid import uuid4


@router.get(
    "/readonly_token",
    name="users:get_readonly_token",
    dependencies=[Depends(check_reader)],
    response_model=UserResponse,
)
async def get_readonly_token(
    user: User = Depends(current_active_user),
    user_db=Depends(get_user_db),
):

    u = await user_db.get(user.id)

    if u.readonly_token:
        return u

    user = await user_db.update(u, {"readonly_token": str(uuid4())})

    return user


@router.post(
    "/rotate_readonly_token",
    name="users:rotate_readonly_token",
    dependencies=[Depends(check_reader)],
    response_model=UserResponse,
)
async def rotate_readonly_token(
    user: User = Depends(current_active_user),
    user_db=Depends(get_user_db),
):

    u = await user_db.get(user.id)
    user = await user_db.update(u, {"readonly_token": str(uuid4())})

    return user


router.include_router(
    fastapi_users.get_users_router(models.UserRead, models.UserUpdate)
)


@router.get("/", response_model=List[UserResponse], name="users:get_users")
async def get_users(db: AsyncSession = Depends(get_async_session)):

    result = await db.execute(select(User))
    return result.scalars().all()


# routes requiring admin role (i.e., role==100)
for r in router.routes:
    n = getattr(r, "name", None)
    deps = getattr(r, "dependencies", [])

    # routes requiring admin role (i.e., role==100)
    if n in [
        "users:patch_user",
        "users:delete_user",
        "users:user",
        "users:get_users",
    ]:
        deps.append(Depends(check_user_admin))

    # Prevent non-admins from changing their role.
    if n in [
        "users:patch_current_user",
        "users:patch_user",
    ]:
        deps.append(Depends(check_protect_role_field))
