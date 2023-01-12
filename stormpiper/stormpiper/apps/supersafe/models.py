import uuid
from enum import Enum
from typing import Optional, Self

from fastapi_users import schemas
from pydantic import BaseModel


class StrEnumMixin(str, Enum):
    def _q(self):
        return self.value

    def __hash__(self) -> int:
        return str(self.value).__hash__()

    def __eq__(self, other):
        if self.__class__ is other.__class__:
            return self._q() == other._q()
        return NotImplemented

    def __ne__(self, other):
        if self.__class__ is other.__class__:
            return self._q() != other._q()
        return NotImplemented

    def __le__(self, other):
        if self.__class__ is other.__class__:
            return self._q() <= other._q()
        return NotImplemented

    def __lt__(self, other):
        if self.__class__ is other.__class__:
            return self._q() < other._q()

    def __ge__(self, other):
        if self.__class__ is other.__class__:
            return self._q() >= other._q()

    def __gt__(self, other):
        if self.__class__ is other.__class__:
            return self._q() > other._q()


class Role(StrEnumMixin):
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
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserRead(UserExtras, schemas.BaseUser[uuid.UUID]):
    role: Role = Role.public
    readonly_token: Optional[uuid.UUID] = None


class UserRegister(UserExtras, schemas.BaseUserCreate):
    ...


class UserCreate(UserExtras, schemas.BaseUserCreate):
    role: Role = Role.public


class UserUpdate(UserExtras, schemas.BaseUserUpdate):
    role: Role = Role.public
