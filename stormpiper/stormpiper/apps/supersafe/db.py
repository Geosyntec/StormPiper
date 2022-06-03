from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy import Column, String, Enum

from .models import UserDB, Role
from stormpiper.core.config import settings
from stormpiper.database.connection import async_engine, get_async_session
from stormpiper.database.schemas.base_class import Base


class UserTable(Base, SQLAlchemyBaseUserTable):
    __tablename__ = settings.DATABASE_USERS_TABLE_NAME

    # These area extra attribute to track.
    # Don't forget to add them to the models
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(Role))


async def create_db_and_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, UserTable)
