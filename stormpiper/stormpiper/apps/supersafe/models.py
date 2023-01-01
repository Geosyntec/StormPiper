import uuid
from enum import Enum
from functools import total_ordering
from typing import Optional

from fastapi_users import schemas
from pydantic import BaseModel


@total_ordering
class Role(Enum):
    none = 0
    public = 1
    user = 2
    editor = 3
    admin = 100

    def __le__(self, other):
        if self.__class__ is other.__class__:
            return self.value <= other.value
        return NotImplemented


class UserExtras(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserRead(UserExtras, schemas.BaseUser[uuid.UUID]):
    role: Role = Role.none
    access_token: Optional[uuid.UUID] = None


class UserCreate(UserExtras, schemas.BaseUserCreate):
    ...


class UserUpdate(UserExtras, schemas.BaseUserUpdate):
    role: Role = Role.none


# class UserDB(User, schemas.BaseUserDB):
#     pass
