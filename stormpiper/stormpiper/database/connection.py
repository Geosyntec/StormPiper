import logging
from typing import Annotated, AsyncIterator

from fastapi import Depends
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from tenacity import after_log  # type: ignore
from tenacity import before_log  # type: ignore
from tenacity import stop_after_attempt  # type: ignore
from tenacity import wait_fixed  # type: ignore
from tenacity import retry

from stormpiper.core.config import settings

logging.basicConfig(level=settings.LOGLEVEL)
logger = logging.getLogger(__name__)

engine_params = {
    "pool_recycle": settings.DATABASE_POOL_RECYCLE,
    "pool_size": 5,
    # Temporarily exceeds the set pool_size if no connections are available.
    "max_overflow": 2,
    "pool_timeout": 10 * 60,  # seconds
    "pool_recycle": 6 * 3600,  # seconds
    "pool_pre_ping": True,
}

engine = create_engine(
    settings.DATABASE_URL_SYNC,
    **engine_params,
)

async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC,
    **engine_params,
)


async_session_maker = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_session() -> AsyncIterator[AsyncSession]:
    async with async_session_maker() as session:
        yield session


AsyncSessionDB = Annotated[AsyncSession, Depends(get_async_session)]


def get_session(engine=engine):
    return sessionmaker(engine, autocommit=False, autoflush=False)


@retry(
    stop=stop_after_attempt(60 * 5),  # 5 mins
    wait=wait_fixed(2),  # 2 seconds
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def reconnect_engine(engine=engine):  # pragma: no cover
    try:
        with engine.begin() as conn:
            # this should connect/login and ensure that the database is available.
            conn.execute(text("select 1")).fetchall()

    except Exception as e:
        logger.error(e)
        logger.info("Engine connection url:", engine.url)
        raise e
