from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

import sqlalchemy as sa
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

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
        """
        self.base = base
        self.tablename = self.base.__tablename__
        self.id = id
        self.changelog = TableChangeLog

    async def get(self, db: AsyncSession, id: Any) -> Optional[SchemaType]:
        result = await db.execute(
            sa.select(self.base).where(getattr(self.base, self.id) == id)
        )
        return result.scalars().first()

    async def get_all(
        self,
        db: AsyncSession,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> Optional[List[SchemaType]]:

        q = sa.select(self.base).offset(offset).limit(limit)
        result = await db.execute(q)
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, new_obj: CreateModelType) -> SchemaType:

        db_obj = self.base(**new_obj.dict(exclude_unset=True))

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        _ = await self.log(db=db)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        id: Any,
        new_obj: Union[UpdateModelType, Dict[str, Any]],
    ) -> SchemaType:

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

        q.execution_options(synchronize_session="fetch")
        await db.execute(q)
        await db.commit()

        obj = await self.get(db=db, id=id)

        if obj is None:  # pragma: no cover
            raise ValueError(
                f"Attemped to update item which does not exist for {self.id}={id}"
            )
        _ = await self.log(db=db)

        return obj

    async def log(self, db: AsyncSession):
        await async_log(tablename=self.tablename, db=db, changelog=self.changelog)

    async def remove(self, db: AsyncSession, *, id: Any) -> None:

        q = sa.delete(self.base).where(getattr(self.base, self.id) == id)

        await db.execute(q)
        try:
            await db.commit()
        except Exception:  # pragma: no cover
            await db.rollback()
            raise
        _ = await self.log(db=db)

        return None
