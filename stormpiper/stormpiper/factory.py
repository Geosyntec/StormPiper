from typing import Any, Dict, Optional

import aiohttp
from brotli_asgi import BrotliMiddleware
from fastapi import FastAPI, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware


from stormpiper.api import api_router
from stormpiper.core.config import settings, stormpiper_path
from stormpiper.earth_engine import login as login_earth_engine
from stormpiper.site import site_router

from stormpiper.apps import supersafe as ss

supersafe = ss.create_app(app_kwargs=dict(root_path="/supersafe"))


def create_app(
    *,
    settings_override: Optional[Dict[str, Any]] = None,
    app_kwargs: Optional[Dict[str, Any]] = None
) -> FastAPI:

    _settings = settings.copy(deep=True)
    if settings_override is not None:  # pragma: no branch
        _settings.update(settings_override)

    kwargs = {}
    if app_kwargs is not None:  # pragma: no cover
        kwargs = app_kwargs

    app = FastAPI(
        title="StormPiper",
        version=_settings.VERSION,
        **kwargs,
    )
    setattr(app, "_settings", _settings)

    @app.on_event("startup")
    async def startup():
        # initialize a dedicated async session to facilitate fetching
        # tiles from external tileservers.
        sessions = {
            "tileserver_session": aiohttp.ClientSession(),
            "redirect_session": aiohttp.ClientSession(),
        }
        setattr(app, "sessions", sessions)

        # log into ee
        login_earth_engine()

        # startup sub-applications
        await supersafe.startup()

    @app.on_event("shutdown")
    async def shutdown():

        # close all sessions
        sessions = getattr(app, "sessions", {})
        for session in sessions.values():
            await session.close()

    app.add_middleware(BrotliMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_settings.ALLOW_CORS_ORIGINS,
        allow_origin_regex=_settings.ALLOW_CORS_ORIGIN_REGEX,
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS", "POST"],
        allow_headers=["*"],
    )
    if "prod" in _settings.ENVIRONMENT.lower():
        app.add_middleware(
            ProxyHeadersMiddleware, trusted_hosts=_settings.TRUSTED_HOSTS
        )
        # app.add_middleware(HTTPSRedirectMiddleware)

    app.include_router(api_router)
    app.include_router(site_router)
    app.mount(path="/supersafe", app=supersafe)

    app.mount(
        "/site/static",
        StaticFiles(directory=stormpiper_path / "site" / "static"),
        name="site/static",
    )

    @app.get("/", name="home")
    async def home(
        request: Request,
        user: ss.users.User = Depends(ss.users.current_user_safe(optional=True)),
    ):
        if user is None:
            return RedirectResponse(request.url_for("login:get_login"))

        return user

    return app
