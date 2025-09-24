import datetime
import logging
import urllib.parse
import uuid
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.jwt import decode_jwt
from sqlalchemy import select

from stormpiper.core import utils
from stormpiper.core.config import settings
from stormpiper.email_helper import email

from .db import AsyncSessionDB, User, UserDB
from .models import Role, UserCreate as UserCreate, UserRead as UserRead, UserUpdate

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.SECRET
    verification_token_secret = settings.SECRET
    reset_password_token_lifetime_seconds = 3600
    verification_token_lifetime_seconds = 3600

    async def on_after_register(
        self, user: User, request: Request | None = None
    ) -> None:
        if request is None:  # pragma: no cover
            return

        logger.info(f"User {user.id} has registered.")

        setattr(request, "_email_template", "welcome_verify")

        await self.request_verify(user=user, request=request)

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ) -> None:
        if request is None:  # pragma: no cover
            return

        client = request.state.sessions["user_email_session"]

        expires_at = (
            max(
                datetime.datetime.utcnow(),
                datetime.datetime.utcnow()
                + datetime.timedelta(
                    seconds=self.reset_password_token_lifetime_seconds
                ),
            )
            .replace(tzinfo=datetime.timezone.utc)
            .isoformat()
        )

        query = urllib.parse.urlencode({"token": token, "expires_at": expires_at})
        reset_url = str(request.url_for("home")) + f"/reset?{query}"

        await email.send_email_to_user(
            template="reset_password",
            client=client,
            email=user.email,
            name=user.first_name,
            token=token,
            reset_url=reset_url,
        )

        logger.info(f"User {user.id} forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ) -> None:
        if request is None:  # pragma: no cover
            return

        client = utils.rgetattr(request, "state.sessions", None).get(
            "user_email_session", None
        )

        expires_at = (
            max(
                datetime.datetime.utcnow(),
                datetime.datetime.utcnow()
                + datetime.timedelta(seconds=self.verification_token_lifetime_seconds),
            )
            .replace(tzinfo=datetime.timezone.utc)
            .isoformat()
        )

        query = urllib.parse.urlencode({"token": token, "expires_at": expires_at})
        verify_url = str(request.url_for("home")) + f"/verify?{query}"

        logger.info(f"verify url: {verify_url}")
        template = getattr(request, "_email_template", "request_verify")

        await email.send_email_to_user(
            template=template,
            client=client,
            email=user.email,
            name=user.first_name,
            token=token,
            verify_url=verify_url,
        )

        logger.info(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )


async def get_user_manager(user_db: UserDB):
    yield UserManager(user_db)


class BetterBearerTransport(BearerTransport):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_token(self, request: Request) -> str | None:
        token = request.headers.get("Authorization", "").split(" ")[-1]
        if token:  # pragma: no branch
            return token


class BetterCookieTransport(CookieTransport):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_token(self, request: Request) -> str | None:  # pragma: no cover; use Bearer
        token = request.cookies.get(self.cookie_name, "")
        if token:
            return token


bearer_transport = BetterBearerTransport(tokenUrl=settings.BEARER_TOKEN_URL)
cookie_transport = BetterCookieTransport(
    cookie_secure=settings.COOKIE_SECURE,
    cookie_httponly=settings.COOKIE_HTTPONLY,
    cookie_samesite=settings.COOKIE_SAMESITE,
)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.SECRET, lifetime_seconds=settings.JWT_LIFETIME_SECONDS
    )


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


current_user = fastapi_users.current_user
current_active_user = current_user(active=True, optional=False)
current_active_super_user = current_user(active=True, superuser=True, optional=False)


def check_role(min_role: Role = Role.admin):
    async def user_role_ge_(user=Depends(current_active_user)):
        if user.role._q() >= min_role._q():
            return user

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    user_role_ge_.__name__ += f"{min_role.value}"

    return user_role_ge_


# check if role >= 100
user_role_ge_admin = check_role(min_role=Role.admin)
Admin = Annotated[User, Depends(user_role_ge_admin)]

# check user has user manager rights
user_role_ge_user_admin = check_role(min_role=Role.user_admin)
UserAdmin = Annotated[User, Depends(user_role_ge_user_admin)]

# check if role >= 1, i.e., not public
user_role_ge_reader = check_role(min_role=Role.reader)
Reader = Annotated[User, Depends(user_role_ge_reader)]

# check user has edit rights
user_role_ge_editor = check_role(min_role=Role.editor)
Editor = Annotated[User, Depends(user_role_ge_editor)]

CurrentUserOrNone = Annotated[User | None, Depends(current_user(optional=True))]


def check_protected_user_patch(field: str, min_role: Role = Role.admin):
    """Check if user is attempting to edit the user role."""

    async def _check_protected_user_patch(
        user_update: UserUpdate,
        user_db: UserDB,
        current_user=Depends(current_active_user),
        id: Any = None,
    ) -> UserUpdate:
        data = user_update.model_dump(exclude_unset=True)

        if field not in data:
            return user_update

        changing_self = True  # assume update is for current user

        other_user_current_role = Role.public
        if id:
            other_user = await user_db.get(id)
            other_user_current_role = getattr(other_user, "role", Role.public)
            changing_self = str(id) == str(current_user.id)

        new_role = user_update.role

        checks = (
            current_user.role._q() >= min_role._q(),
            current_user.role._q() >= new_role._q(),
            current_user.role._q() >= other_user_current_role._q(),
            # if you're changing yourself and you're changing the role attribute, break the check
            not (changing_self and (current_user.role._q() != new_role._q())),
        )

        # prevent users from elevating permissions
        if all(checks):
            # if checks pass and new role is a user admin or higher, then we need to set
            # the is_superuser from `fastapi-users`` so they can edit other user accounts.
            if new_role._q() >= Role.user_admin._q() and id:
                _ = await user_db.update(await user_db.get(id), {"is_superuser": True})
            return user_update

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    _check_protected_user_patch.__name__ = (
        f"user_role_ge_{min_role.value}_and_field_{field}_editable"
    )

    return _check_protected_user_patch


check_protect_role_field = check_protected_user_patch(
    field="role", min_role=Role.user_admin
)


def get_token_from_backend(request: Request) -> str | None:
    for be in fastapi_users.authenticator.backends:
        token = be.transport.get_token(request)  # type: ignore
        if token:  # pragma: no branch
            return token

    return None  # pragma: no cover


def check_token(token: str):
    strat = get_jwt_strategy()

    try:
        data = decode_jwt(
            token,
            secret=strat.secret,
            audience=strat.token_audience,
            algorithms=[strat.algorithm],
        )

        return data

    except jwt.PyJWTError as e:  # pragma: no cover
        logger.exception(e)
        return None


def is_valid_token(request: Request) -> bool:
    token = get_token_from_backend(request)
    if token is None:  # pragma: no cover
        return False
    data = check_token(token)
    return bool(data)


async def check_is_valid_token(request: Request):
    isvalid = is_valid_token(request)

    if not isvalid:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


def validate_uuid4(token: str):
    try:
        uuid.UUID(token, version=4)
        return token
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


async def check_readonly_token(
    db: AsyncSessionDB,
    token: str = Depends(validate_uuid4),
):
    result = await db.execute(select(User).where(User.readonly_token == token))

    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    if not user.role._q() >= Role.reader._q():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return token
