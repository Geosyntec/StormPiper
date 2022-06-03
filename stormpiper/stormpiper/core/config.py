import secrets
from importlib import resources
from typing import List, Literal, Optional, Union
import json
from pathlib import Path

from pydantic import AnyHttpUrl, BaseSettings, validator

import stormpiper

with resources.path("stormpiper", "__init__.py") as file:
    stormpiper_path = file.parent


class Settings(BaseSettings):
    VERSION: str = stormpiper.__version__
    ENVIRONMENT: str = "development"

    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # ALLOW_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000", \
    # "http://localhost:8080", "http://local.dockertoolbox.tiangolo.com"]'
    ALLOW_CORS_ORIGINS: List[Union[AnyHttpUrl, Literal["*"]]] = []
    ALLOW_CORS_ORIGIN_REGEX: Optional[str] = None
    TRUSTED_HOSTS: Union[List[str], str] = "127.0.0.1"

    @validator("ALLOW_CORS_ORIGINS", pre=True)  # pragma: no cover
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # EE Auth
    EE_SERVICE_ACCOUNT: str = ""
    EE_PROJECT_DIRECTORY: str = ""
    EE_JSON_BASE64: str = ""

    # Database
    ADMIN_ACCOUNT_PASSWORD: str = "change me with an env variable"
    SECRET: str = "change me with an env variable"
    DATABASE_URL_ASYNC: str = "sqlite+aiosqlite:///./supersafe.db"
    DATABASE_URL_SYNC: str = "sqlite:///./supersafe.db"
    DATABASE_USERS_TABLE_NAME: str = "users"

    # Users Auth
    COOKIE_SECURE: bool = True
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"
    BEARER_TOKEN_URL: str = "auth/jwt-bearer/login"

    # Worker
    REDIS_BROKER_URL: str = "redis://redis:6379/0"
    REDIS_RESULT_BACKEND: str = "redis://redis:6379/0"
    ENABLE_BEAT_SCHEDULE: bool = False

    # Email via https://dev.mailjet.com/email/guides/send-api-v31/
    EMAIL_API_KEY: str = ""
    EMAIL_API_SECRET: str = ""

    # logger
    LOGLEVEL: str = "INFO"

    # AGOL
    TACOMA_EPSG: int = 2927

    class Config:
        extra = "allow"
        env_prefix = "STP_"
        try:
            env_file = ".env"
        except FileNotFoundError:  # pragma: no cover
            pass

    def update(self, other: dict) -> None:  # pragma: no cover
        for key, value in other.items():
            setattr(self, key, value)


settings = Settings()

external_resources = json.loads(
    (Path(__file__).parent / "external_resources.json").read_text()
)
