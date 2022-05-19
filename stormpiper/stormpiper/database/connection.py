from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine

from stormpiper.core.config import settings

engine = create_engine(settings.DATABASE_URL_SYNC)
async_engine = create_async_engine(settings.DATABASE_URL_ASYNC)
