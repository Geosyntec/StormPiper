from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import ConfigDict
from sqlalchemy import select

from stormpiper.apps.supersafe import models
from stormpiper.apps.supersafe.users import (
    User,
    check_protect_role_field,
    fastapi_users,
    user_role_ge_reader,
    user_role_ge_user_admin,
)

from ..depends import AsyncSessionDB, Reader, UserDB


class UserResponse(models.UserRead):
    model_config = ConfigDict(from_attributes=True)


router = APIRouter()


@router.get(
    "/me/readonly_token",
    name="users:get_readonly_token",
    dependencies=[Depends(user_role_ge_reader)],
    response_model=UserResponse,
)
async def get_readonly_token(
    user: Reader,
    user_db: UserDB,
):
    if user.readonly_token:  # type: ignore
        return user

    user_ = await user_db.update(user, {"readonly_token": str(uuid4())})
    return user_


@router.post(
    "/me/rotate_readonly_token",
    name="users:rotate_readonly_token",
    dependencies=[Depends(user_role_ge_reader)],
    response_model=UserResponse,
)
async def rotate_readonly_token(
    user: Reader,
    user_db: UserDB,
):
    user_ = await user_db.update(user, {"readonly_token": str(uuid4())})
    return user_


router.include_router(
    fastapi_users.get_users_router(models.UserRead, models.UserUpdate)
)


@router.get("/", response_model=list[UserResponse], name="users:get_users")
async def get_users(db: AsyncSessionDB):
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
        deps.append(Depends(user_role_ge_user_admin))

    # Prevent non-admins from changing their role.
    if n in [
        "users:patch_current_user",
        "users:patch_user",
    ]:
        deps.append(Depends(check_protect_role_field))
