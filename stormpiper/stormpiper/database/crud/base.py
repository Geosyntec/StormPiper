import datetime
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

import sqlalchemy as sa
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from ..schemas.base import Base, TableChangeLog
from ..changelog import async_log, sync_log

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

    def sync_get(self, db: Session, id: Any) -> Optional[SchemaType]:
        print(f"called getter for {id}")
        return db.query(self.base).filter(getattr(self.base, self.id) == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[SchemaType]:
        return db.query(self.base).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateModelType) -> SchemaType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.base(**obj_in_data)  # type: ignore
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def _update_orm(
        *, db_obj: SchemaType, obj_in: Union[UpdateModelType, Dict[str, Any]]
    ) -> SchemaType:

        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        return db_obj

    def sync_update(
        self,
        db: Session,
        *,
        db_obj: SchemaType,
        obj_in: Union[UpdateModelType, Dict[str, Any]],
    ) -> SchemaType:

        updated_obj = self._update_orm(db_obj=db_obj, obj_in=obj_in)

        db.add(updated_obj)
        db.commit()
        db.refresh(updated_obj)
        return updated_obj

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

        if obj is None:
            raise ValueError(
                f"Attemped to update item which does not exist for {self.id}={id}"
            )
        _ = await self.log(db=db)

        return obj

    def sync_log(self, db: Session):
        sync_log(tablename=self.tablename, db=db, changelog=self.changelog)

    async def log(self, db: AsyncSession):
        await async_log(tablename=self.tablename, db=db, changelog=self.changelog)

    # def update_many(
    #     self,
    #     db: Session,
    #     *,
    #     db_obj: SchemaType,
    #     obj_ins: List[Union[UpdateModelType, Dict[str, Any]]]
    # ) -> List[SchemaType]:

    #     batch = [self._update_orm(db_obj=db_obj, obj_in=obj_in) for obj_in in obj_ins]
    #     db.add_all(batch)
    #     db.commit()
    #     [db.refresh(b) for b in batch]
    #     return batch

    def remove(self, db: Session, *, id: int) -> Optional[SchemaType]:
        obj = db.query(self.base).filter(getattr(self.base, self.id) == id).first()
        if not obj:
            return
        db.delete(obj)
        db.commit()
        return obj
