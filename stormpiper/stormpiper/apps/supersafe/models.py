from enum import Enum
from functools import total_ordering


from fastapi_users import models
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
    first_name: str = ""
    last_name: str = ""


class User(UserExtras, models.BaseUser):
    role: Role = Role.none
    pass


class UserCreate(UserExtras, models.BaseUserCreate):
    pass


class UserUpdate(UserExtras, models.BaseUserUpdate):
    role: Role = Role.none
    pass


class UserDB(User, models.BaseUserDB):
    pass
