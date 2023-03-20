from typing import Any, Generic, Type, TypeVar

import sqlalchemy as sa
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.exceptions import RecordNotFound
from ..changelog import async_log
from ..schemas.base import Base, TableChangeLog

SchemaType = TypeVar("SchemaType", bound=Base)
CreateModelType = TypeVar("CreateModelType", bound=BaseModel)
UpdateModelType = TypeVar("UpdateModelType", bound=BaseModel)


class CRUDBase(Generic[SchemaType, CreateModelType, UpdateModelType]):
    def __init__(self, base: Type[SchemaType], id: str = "id"):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `base`: A SQLAlchemy class

        **Reference**

        https://github.com/tiangolo/full-stack-fastapi-postgresql/blob/master/%7B%7Bcookiecutter.project_slug%7D%7D/backend/app/app/crud/base.py

        """
        self.base = base
        self.tablename = self.base.__tablename__
        self.id = id
        self.changelog = TableChangeLog

    async def get(self, db: AsyncSession, id: Any) -> SchemaType | None:
        result = await db.execute(
            sa.select(self.base).where(getattr(self.base, self.id) == id)
        )
        return result.scalars().first()

    async def get_all(
        self,
        db: AsyncSession,
        limit: int | None = None,
        offset: int | None = None,
    ) -> list[SchemaType] | None:
        q = sa.select(self.base).offset(offset).limit(limit)
        result = await db.execute(q)
        return result.scalars().all()

    async def on_after_create(self, *, db: AsyncSession, obj: SchemaType) -> None:
        return None

    async def create(self, db: AsyncSession, *, new_obj: CreateModelType) -> SchemaType:
        db_obj = self.base(**new_obj.dict(exclude_unset=True))

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        await self.log(db=db)
        await self.on_after_create(db=db, obj=db_obj)

        return db_obj

    async def on_after_update(self, *, db: AsyncSession, obj: SchemaType) -> None:
        return None

    async def update(
        self,
        db: AsyncSession,
        *,
        id: Any,
        new_obj: UpdateModelType | dict[str, Any],
    ) -> SchemaType:
        obj = await self.get(db=db, id=id)

        if obj is None:  # pragma: no cover
            raise RecordNotFound(f"Update Failed. Record not found for {self.id}={id}")

        if isinstance(new_obj, dict):
            update_data = new_obj
        else:
            update_data = new_obj.dict(exclude_unset=True)

        update_data[self.id] = id

        q = (
            sa.update(self.base)
            .where(getattr(self.base, self.id) == id)
            .values(update_data)
        )

        await db.execute(q)
        await db.commit()
        await db.refresh(obj)
        await self.log(db=db)
        await self.on_after_update(db=db, obj=obj)

        return obj

    async def log(self, db: AsyncSession):
        await async_log(tablename=self.tablename, db=db, changelog=self.changelog)

    async def remove(self, db: AsyncSession, *, id: Any) -> None:
        q = sa.delete(self.base).where(getattr(self.base, self.id) == id)

        await db.execute(q)
        await db.commit()
        await self.log(db=db)

        return None
