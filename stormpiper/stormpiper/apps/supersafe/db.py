import uuid

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy import Column, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.core.config import settings
from stormpiper.database.connection import get_async_session
from stormpiper.database.schemas.base_class import Base

from .models import Role


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = settings.DATABASE_USERS_TABLE_NAME

    # These area extra attribute to track.
    # Don't forget to add them to the models
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(Role), server_default="none")
    access_token = Column(UUID, default=uuid.uuid4)


async def create_db_and_tables(async_engine):
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
