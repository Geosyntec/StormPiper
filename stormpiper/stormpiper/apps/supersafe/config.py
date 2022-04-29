from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    ADMIN_ACCOUNT_PASSWORD: str = Field(...)  # "change me with an environmet variable"
    SECRET: str = Field(...)  # "change me with an environmet variable"
    DATABASE_URL_ASYNC: str = "sqlite+aiosqlite:///./supersafe.db"
    DATABASE_USERS_TABLE_NAME: str = "users"

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
