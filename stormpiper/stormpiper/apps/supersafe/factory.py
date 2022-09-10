from typing import Any, Dict, Optional

from fastapi import APIRouter, FastAPI

from stormpiper.core.config import settings

from . import __version__, models
from .users import bearer_backend, cookie_backend, fastapi_users


def create_router(**kwargs):

    router = APIRouter(**kwargs)

    router.include_router(
        fastapi_users.get_auth_router(bearer_backend, requires_verification=True),
        prefix="/auth/jwt-bearer",
        tags=["auth"],
    )
    router.include_router(
        fastapi_users.get_auth_router(cookie_backend, requires_verification=True),
        prefix="/auth/jwt-cookie",
        tags=["auth"],
    )
    router.include_router(
        fastapi_users.get_register_router(models.UserRead, models.UserCreate),
        prefix="/auth",
        tags=["auth"],
    )
    router.include_router(
        fastapi_users.get_reset_password_router(),
        prefix="/auth",
        tags=["auth"],
    )
    router.include_router(
        fastapi_users.get_verify_router(models.UserRead),
        prefix="/auth",
        tags=["auth"],
    )

    return router


def create_app(
    *,
    settings_override: Optional[Dict[str, Any]] = None,
    app_kwargs: Optional[Dict[str, Any]] = None,
) -> FastAPI:

    _settings = settings.copy(deep=True)
    if settings_override is not None:  # pragma: no branch
        _settings.update(settings_override)

    kwargs = {}
    if app_kwargs is not None:  # pragma: no cover
        kwargs = app_kwargs

    app = FastAPI(
        title="supersafe",
        version=__version__,
        **kwargs,
    )
    setattr(app, "_settings", _settings)

    router = create_router()
    app.include_router(router)

    return app
