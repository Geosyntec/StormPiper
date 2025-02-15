import contextlib

from fastapi_users.exceptions import UserAlreadyExists
from pydantic import EmailStr

from stormpiper.core.config import settings
from stormpiper.database.connection import get_async_session

from .db import get_user_db
from .models import Role, UserCreate, UserUpdate
from .users import get_user_manager

get_async_session_context = contextlib.asynccontextmanager(get_async_session)
get_user_db_context = contextlib.asynccontextmanager(get_user_db)
get_user_manager_context = contextlib.asynccontextmanager(get_user_manager)


async def create_user(
    email: EmailStr,
    password: str,
    is_superuser: bool = False,
    force_set_password: bool = False,
    **kwargs,
):  # pragma: no cover
    try:
        print(f"trying to create user {email}")
        async with get_async_session_context() as session:
            async with get_user_db_context(session) as user_db:
                async with get_user_manager_context(user_db) as user_manager:
                    user = await user_manager.user_db.get_by_email(email)
                    if user is not None and force_set_password:
                        await user_manager.update(
                            UserUpdate(password=password),
                            user,  # type: ignore
                        )

                    user = await user_manager.create(
                        UserCreate(
                            email=email,
                            password=password,
                            is_superuser=is_superuser,
                            **kwargs,
                        )
                    )
                    print(f"User created {user}")
    except UserAlreadyExists:
        print(f"User {email} already exists")


async def create_admin():  # pragma: no cover
    return await create_user(
        email="admin@geosyntec.com",  # type: ignore
        password=settings.ADMIN_ACCOUNT_PASSWORD,
        is_superuser=True,
        is_verified=True,
        force_set_password=True,
    )


async def create_service_datastudio():  # pragma: no cover
    return await create_user(
        email="datastudio@geosyntec.com",  # type: ignore
        password=settings.DATASTUDIO_ACCOUNT_PASSWORD,
        force_set_password=True,
        is_verified=True,
        role=Role.reader,
    )


async def create_demo_users():  # pragma: no cover
    await create_user(
        first_name="Joe",
        last_name="Shmo",
        email="public@nowhere.com",  # type: ignore
        password="unsafe_password",
        force_set_password=True,
    )

    await create_user(
        email="existing_reader@example.com",  # type: ignore
        password="existing_reader_password",
        force_set_password=True,
        is_verified=True,
        role=Role.reader,
    )

    await create_user(
        email="existing_user@example.com",  # type: ignore
        password="existing_user_password",
        force_set_password=True,
        is_verified=True,
        role=Role.editor,
    )

    await create_user(
        email="existing_user_admin@example.com",  # type: ignore
        password="existing_user_admin_password",
        force_set_password=True,
        is_verified=True,
        role=Role.user_admin,
    )


async def create_all():  # pragma: no cover
    await create_admin()
    await create_service_datastudio()
    await create_demo_users()


def main():  # pragma: no cover
    import asyncio
    import platform

    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # type: ignore

    asyncio.run(create_all())


if __name__ == "__main__":  # pragma: no cover
    main()
