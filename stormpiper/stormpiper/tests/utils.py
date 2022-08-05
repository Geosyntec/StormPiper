from pathlib import Path
from typing import AsyncGenerator, Generator

import sqlalchemy as sa
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from stormpiper.core.config import settings
from stormpiper.database.schemas.base import Base, User

hasher = CryptContext(schemes=["bcrypt"], deprecated="auto").hash


def get_engine():
    path = Path(__file__).parent.resolve() / "test.db"
    engine = sa.create_engine(f"sqlite:///{path}")
    return engine


def get_async_engine():
    path = Path(__file__).parent.resolve() / "test.db"
    async_engine = create_async_engine(f"sqlite+aiosqlite:///{path}")
    return async_engine


engine = get_engine()
async_engine = get_async_engine()
session_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:

    async_session_maker = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session_maker() as session:
        yield session


def clear_db():
    tables = Base.metadata.tables.keys()
    with engine.begin() as conn:
        for table in tables:
            conn.execute(f"delete from {table}")


def get_token(app, username, password):
    response = app.post(
        "/auth/jwt-bearer/login",
        data={
            "username": username,
            "password": password,
        },
    )

    return response


def seed_db():

    with session_maker.begin() as session:

        admin = User(
            email="admin@geosyntec.com",
            hashed_password=hasher(settings.ADMIN_ACCOUNT_PASSWORD),
            is_active=True,
            is_superuser=True,
            is_verified=True,
            role="admin",
        )

        existing_user = User(
            email="existing_user@example.com",
            hashed_password=hasher("existing_user_password"),
            is_active=True,
            role="user",
        )

        batch = [admin, existing_user]

        session.add_all(batch)
        session.commit()

    # with Session.begin() as session:
    #     result = session.query(User)
    #     print([(i.id, i.email, i.hashed_password) for i in result.all()])

    # .. initial data here


# def reset_db():
#     clear_db()
#     seed_db()
