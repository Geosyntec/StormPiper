import uuid
from enum import Enum
from functools import total_ordering
from typing import Optional

from fastapi_users import schemas
from pydantic import BaseModel


@total_ordering
class Role(Enum):
    none = 0
    public = 0  # alias for none;
    reader = 20  # auth user; read only
    user = 20  # auth user; read only; alias for reader; deprecated
    editor = 40  # auth user; read/write
    user_admin = 60  # grant rw or user_admin to other users
    admin = 100  # systems admin; dev use only.

    def __le__(self, other):
        if self.__class__ is other.__class__:
            return self.value <= other.value
        return NotImplemented


class UserExtras(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserRead(UserExtras, schemas.BaseUser[uuid.UUID]):
    role: Role = Role.public
    access_token: Optional[uuid.UUID] = None


class UserRegister(UserExtras, schemas.BaseUserCreate):
    ...


class UserCreate(UserExtras, schemas.BaseUserCreate):
    role: Role = Role.public


class UserUpdate(UserExtras, schemas.BaseUserUpdate):
    role: Role = Role.public
