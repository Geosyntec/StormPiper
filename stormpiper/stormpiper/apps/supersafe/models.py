import uuid
from enum import Enum
from typing import Self

from fastapi_users import schemas
from pydantic import BaseModel


class Role(str, Enum):
    public = "public"  # alias for none;
    none = "none"
    reader = "reader"  # auth user; read only
    user = "user"  # auth user; read only; alias for reader; deprecated
    editor = "editor"  # auth user; read/write
    user_admin = "user_admin"  # grant rw or user_admin to other users
    admin = "admin"  # systems admin; dev use only.

    def _q(self: Self) -> int:
        _role_mapper: dict[str, int] = dict(
            public=0,  # alias for none;
            none=0,
            reader=20,  # auth user; read only
            user=20,  # auth user; read only; alias for reader; deprecated
            editor=40,  # auth user; read/write
            user_admin=60,  # grant rw or user_admin to other users
            admin=100,  # systems admin; dev use only.
        )
        return _role_mapper[self.value]


class UserExtras(BaseModel):
    first_name: str | None = None
    last_name: str | None = None


class UserRead(UserExtras, schemas.BaseUser[uuid.UUID]):
    role: Role = Role.public
    readonly_token: uuid.UUID | None = None


class UserRegister(UserExtras, schemas.BaseUserCreate):
    ...


class UserCreate(UserExtras, schemas.BaseUserCreate):
    role: Role = Role.public


class UserUpdate(UserExtras, schemas.BaseUserUpdate):
    role: Role = Role.public
