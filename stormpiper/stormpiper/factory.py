import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import aiohttp
from brotli_asgi import BrotliMiddleware
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from nereid.factory import create_app as create_nereid_app
from ratelimit import RateLimitMiddleware, Rule
from ratelimit.backends.redis import RedisBackend
from redis.asyncio import StrictRedis

import stormpiper.bg_worker as bg
from stormpiper.api.router import api_router, rpc_router
from stormpiper.api.docs import get_better_swagger_ui_html
from stormpiper.apps import ratelimiter
from stormpiper.apps import supersafe as ss
from stormpiper.apps.supersafe.users import user_role_ge_admin, user_role_ge_reader
from stormpiper.core.config import settings
from stormpiper.core.context import get_context
from stormpiper.earth_engine import ee_continuous_login


ss_router = ss.create_router()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _settings = getattr(app, "_settings", settings)
    if _settings.EE_LOGIN_ON_STARTUP:
        asyncio.create_task(ee_continuous_login(_settings.EE_LOGIN_INTERVAL_SECONDS))

    state = {}
    state["context"] = get_context()
    async with (
        aiohttp.ClientSession() as tileserver_session,
        aiohttp.ClientSession() as user_email_session,
    ):
        # initialize a dedicated async session to facilitate fetching
        # tiles from external tileservers.
        state["sessions"] = {
            "tileserver_session": tileserver_session,
            "user_email_session": user_email_session,
        }

        yield state


def create_app(
    *,
    settings_override: dict[str, Any] | None = None,
    app_kwargs: dict[str, Any] | None = None,
) -> FastAPI:
    _settings = settings.model_copy(deep=True)
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
        openapi_url=None,
        lifespan=lifespan,
        **kwargs,
    )
    setattr(app, "_settings", _settings)

    app.add_middleware(BrotliMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(o) for o in _settings.ALLOW_CORS_ORIGINS],
        allow_origin_regex=_settings.ALLOW_CORS_ORIGIN_REGEX,
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS", "POST", "PATCH", "DELETE"],
        allow_headers=["*"],
    )
    if "deploy" in _settings.ENVIRONMENT.lower():
        # app.add_middleware(
        #     ProxyHeadersMiddleware, trusted_hosts=_settings.TRUSTED_HOSTS
        # )
        # app.add_middleware(HTTPSRedirectMiddleware)
        pass

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
    app.include_router(ss_router)

    @app.get("/ping", name="ping")
    async def ping(
        request: Request,
    ) -> dict:
        task = bg.ping.apply_async().get()
        if not task:
            raise HTTPException(
                status_code=406, detail="cannot connect to background worker."
            )

        msg = {
            "message": "welcome home.",
            "version": _settings.VERSION,
            "environment": _settings.ENVIRONMENT,
            "has_worker": task,
        }

        return msg

    pkg_path = Path(__file__).parent

    app.mount(
        "/app/assets",
        StaticFiles(directory=pkg_path / "spa/build/assets"),
        name="app",
    )

    nereid_app = create_nereid_app(
        settings_override={
            "ASYNC_MODE": "add",
            "DATA_DIRECTORY": pkg_path / "data" / "project_data",
        },
        app_kwargs={"dependencies": [Depends(user_role_ge_admin)]},
    )

    app.mount("/api/nereid", nereid_app, name="nereid")

    templates = Jinja2Templates(directory=pkg_path / "spa/build")

    @app.get(
        "/api/docs", include_in_schema=False, dependencies=[Depends(user_role_ge_admin)]
    )
    async def custom_swagger_ui_html():
        resp = get_better_swagger_ui_html(
            openapi_url="/openapi.json",
            title=app.title + " - Swagger UI",
        )
        return resp

    @app.get("/app", name="home")
    @app.get("/app/{fullpath:path}")
    async def serve_spa(request: Request, fullpath: str | None = None) -> Response:
        return templates.TemplateResponse("index.html", {"request": request})

    @app.get("/")
    async def home(request: Request) -> Response:
        return RedirectResponse("/app")

    @app.get("/openapi.json", dependencies=[Depends(user_role_ge_reader)])
    async def openapi_override():
        return app.openapi()

    return app
