from typing import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from stormpiper.core.config import settings

engine = create_engine(
    settings.DATABASE_URL_SYNC, pool_recycle=settings.DATABASE_POOL_RECYCLE
)

async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC, pool_recycle=settings.DATABASE_POOL_RECYCLE
)

async_session_maker = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

session_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
