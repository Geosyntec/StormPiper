import json
import secrets
from pathlib import Path
from typing import List, Literal, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, validator

import stormpiper

stormpiper_path = Path(__file__).parent.parent.resolve()


class Settings(BaseSettings):
    VERSION: str = stormpiper.__version__  # type: ignore
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

    # EE
    EE_LOGIN_ON_STARTUP: bool = True
    EE_SERVICE_ACCOUNT: str = ""
    EE_PROJECT_DIRECTORY: str = ""
    EE_JSON_BASE64: str = ""
    EE_LOGIN_INTERVAL_SECONDS: int = 3600 * 4  # every four hours
    EE_RUNOFF_PATH = (
        "projects/ee-stormwaterheatmap/assets/production/Mean_Annual_Q_4_epochs"
    )
    EE_COC_PATH = "projects/ee-tacoma-watershed/assets/production/coc_concentrations"

    # Database
    ADMIN_ACCOUNT_PASSWORD: str = "change me with an env variable"
    SECRET: str = "change me with an env variable"
    DATABASE_URL_ASYNC: str = ""
    DATABASE_URL_SYNC: str = ""
    DATABASE_USERS_TABLE_NAME: str = "user"
    DATABASE_POOL_RECYCLE: int = 1800

    # Users Auth
    COOKIE_SECURE: bool = True
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "strict"
    BEARER_TOKEN_URL: str = "auth/jwt-bearer/login"
    JWT_LIFETIME_SECONDS: int = 24 * 3600

    # Worker
    REDIS_BROKER_URL: str = "redis://redis:6379/0"
    REDIS_RESULT_BACKEND: str = "redis://redis:6379/0"
    ENABLE_BEAT_SCHEDULE: bool = False

    # Email via https://dev.mailjet.com/email/guides/send-api-v31/

    EMAIL_SEND_URL: str = "http://example.com"
    EMAIL_API_KEY: str = ""
    EMAIL_API_SECRET: str = ""
    MAINTAINER_EMAIL_LIST: Union[str, List[str]] = ""

    @validator("MAINTAINER_EMAIL_LIST", pre=True)  # pragma: no cover
    def assemble_maintainer_emails(
        cls, v: Union[str, List[str]]
    ) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

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


default_global_settings = [
    {"variable": "discount_rate", "value": "0.05"},
    {"variable": "planning_horizon_yrs", "value": "50"},
]
