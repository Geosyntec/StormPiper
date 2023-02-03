import asyncio
from typing import Any, Dict, Optional

import aiohttp
from brotli_asgi import BrotliMiddleware
from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from ratelimit import RateLimitMiddleware, Rule
from ratelimit.backends.redis import RedisBackend
from redis.asyncio import StrictRedis
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from stormpiper.api import api_router, rpc_router
from stormpiper.apps import ratelimiter
from stormpiper.apps import supersafe as ss
from stormpiper.apps.supersafe.users import check_admin
from stormpiper.core.config import settings
from stormpiper.earth_engine import ee_continuous_login
from stormpiper.site import site_router

ss_router = ss.create_router()


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
        docs_url=None,
        redoc_url=None,
        **kwargs,
    )
    setattr(app, "_settings", _settings)

    @app.on_event("startup")
    async def startup():
        # initialize a dedicated async session to facilitate fetching
        # tiles from external tileservers.
        sessions = {
            "tileserver_session": aiohttp.ClientSession(),
            "user_email_session": aiohttp.ClientSession(),
        }
        setattr(app, "sessions", sessions)

        # login to ee
        if _settings.EE_LOGIN_ON_STARTUP:
            asyncio.create_task(
                ee_continuous_login(_settings.EE_LOGIN_INTERVAL_SECONDS)
            )

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

    app.add_middleware(
        RateLimitMiddleware,
        authenticate=ratelimiter.client_ip,
        backend=RedisBackend(StrictRedis.from_url(_settings.REDIS_BROKER_URL)),
        config={
            r".+?/token/": [Rule(minute=120, second=5, block_time=60)],
            r".+?/auth/": [Rule(minute=30, second=5, block_time=3600)],
        },
    )

    app.include_router(api_router)
    app.include_router(rpc_router)
    app.include_router(site_router)
    app.include_router(ss_router)

    @app.get("/ping", name="ping")
    async def ping(
        request: Request,
        user: ss.users.User = Depends(ss.users.current_user_safe(optional=True)),
    ) -> Dict:
        msg = {
            "message": "welcome home.",
            "version": _settings.VERSION,
            "user": user,
            "redirect_url_path_for": request.scope["router"].url_path_for(
                "login:get_login"
            ),
            "redirect_url_for": request.url_for("login:get_login"),
        }

        return msg

    app.mount(
        "/site/static",
        StaticFiles(directory="stormpiper/site/static"),
        name="site/static",
    )

    app.mount(
        "/app/assets",
        StaticFiles(directory="stormpiper/spa/build/assets"),
        name="app",
    )

    templates = Jinja2Templates(directory="stormpiper/spa/build")

    @app.get("/docs", include_in_schema=False, dependencies=[Depends(check_admin)])
    async def custom_swagger_ui_html():
        return get_swagger_ui_html(
            openapi_url=str(app.openapi_url),
            title=app.title + " - Swagger UI",
        )

    @app.get("/app", name="home")
    @app.get("/app/{fullpath:path}")
    async def serve_spa(request: Request, fullpath: Optional[str] = None) -> Response:
        return templates.TemplateResponse("index.html", {"request": request})

    @app.get("/")
    async def home(request: Request) -> Response:
        return RedirectResponse("/app")

    return app
