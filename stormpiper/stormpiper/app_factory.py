from typing import Any, Dict, Optional

import aiohttp
from brotli_asgi import BrotliMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from stormpiper.api import api_router
from stormpiper.core.config import settings, stormpiper_path
from stormpiper.site import site_router


def create_app(settings_override: Optional[Dict[str, Any]] = None) -> FastAPI:
    if settings_override is not None:  # pragma: no cover
        settings_override = {}

    _settings = settings.copy(update=settings_override)

    app = FastAPI(
        title="StormPiper",
        version=_settings.VERSION,
        # docs_url=None, redoc_url=None
    )

    app.add_middleware(BrotliMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_settings.ALLOW_CORS_ORIGINS,
        allow_origin_regex=_settings.ALLOW_CORS_ORIGIN_REGEX,
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS", "POST"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    app.include_router(site_router)

    app.mount(
        "/site/static",
        StaticFiles(directory=stormpiper_path / "site" / "static"),
        name="site/static",
    )

    @app.on_event("startup")
    def register_sessions():
        sessions = {"tileserver_session": aiohttp.ClientSession()}
        setattr(app, "sessions", sessions)

    @app.on_event("shutdown")
    async def close_sessions():
        sessions = getattr(app, "sessions", {})
        for _, session in sessions.items():
            await session.close()

    return app
