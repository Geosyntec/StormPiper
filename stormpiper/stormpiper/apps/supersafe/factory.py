from typing import Optional, Dict, Any
from fastapi import Depends, FastAPI
from .users import (
    bearer_backend,
    cookie_backend,
    create_db_and_tables,
    fastapi_users,
)
from .config import settings
from . import __version__


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

    app.include_router(
        fastapi_users.get_auth_router(bearer_backend),
        prefix="/auth/jwt-bearer",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_auth_router(cookie_backend),
        prefix="/auth/jwt-cookie",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_register_router(), prefix="/auth", tags=["auth"]
    )
    app.include_router(
        fastapi_users.get_reset_password_router(),
        prefix="/auth",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_verify_router(),
        prefix="/auth",
        tags=["auth"],
    )

    async def startup():
        # Not needed if you setup a migration system like Alembic
        await create_db_and_tables()

        # if "sqlite" in _settings.DATABASE_URL_ASYNC:
        #     from .scripts import init_users

        #     await init_users.create_all()

    setattr(app, "startup", startup)

    @app.on_event("startup")
    async def call_startup():
        await startup()

    return app
