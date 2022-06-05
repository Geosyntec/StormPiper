import uuid
from typing import Optional

from fastapi import Depends, Request, HTTPException, status
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase

from .db import get_user_db, create_db_and_tables, User, get_async_session
from .models import UserRead, UserCreate, UserUpdate, Role
from stormpiper.core.config import settings


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.SECRET
    verification_token_secret = settings.SECRET

    def __init__(self, *args, secret=None, **kwargs):
        super().__init__(*args, **kwargs)
        if secret:
            self.reset_password_token_secret = secret
            self.verification_token_secret = secret

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl=settings.BEARER_TOKEN_URL)
cookie_transport = CookieTransport(
    cookie_secure=settings.COOKIE_SECURE,
    cookie_httponly=settings.COOKIE_HTTPONLY,
    cookie_samesite=settings.COOKIE_SAMESITE,
)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.SECRET, lifetime_seconds=3600)


bearer_backend = AuthenticationBackend(
    name="jwt.bearer",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

cookie_backend = AuthenticationBackend(
    name="jwt.cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager=get_user_manager,
    auth_backends=[bearer_backend, cookie_backend],
)


def current_user_safe(**kwargs):
    async def _get_current_user(
        user: UserRead = Depends(fastapi_users.current_user(**kwargs)),
    ) -> Optional[UserRead]:
        if user:
            return UserRead(**user.dict())

    return _get_current_user


current_active_user = current_user_safe(active=True)
current_active_super_user = current_user_safe(active=True, superuser=True)


def check_role(min_role: Role = Role.admin):
    async def current_active_user_role(user=Depends(current_active_user)):
        if user.role >= min_role:
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"reason": f"requires {min_role} permissions or higher."},
        )

    return current_active_user_role


# check if role >= 100
check_admin = check_role(min_role=Role.admin)

# check if role >= 1, i.e., not public
check_user = check_role(min_role=Role.user)


def check_protected_field_role(field: str, min_role: Role = Role.admin):
    """Check if user is attempting to edit the user role."""

    async def current_active_user_role(
        user_update: UserUpdate, user=Depends(current_active_user)
    ):

        if field not in user_update.dict(exclude_unset=True):
            return user_update

        if user.role >= min_role:
            return user_update

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"reason": f"requires {min_role} permissions or higher."},
        )

    return current_active_user_role


check_protect_role_field = check_protected_field_role(field="role", min_role=Role.admin)
