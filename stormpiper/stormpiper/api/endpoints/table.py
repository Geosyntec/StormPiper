from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.apps.supersafe.users import user_role_ge_reader
from stormpiper.database.connection import get_async_session
from stormpiper.database.dependencies import async_is_dirty

router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@router.get("/{tablename}/is_dirty", name="results:get_result_is_dirty")
async def get_table_is_dirty(
    tablename: str,
    db: AsyncSession = Depends(get_async_session),
):
    response = {"is_dirty": True, "last_updated": "0"}

    is_dirty, last_updated = await async_is_dirty(tablename=tablename, db=db)

    response["is_dirty"] = is_dirty
    response["last_updated"] = last_updated

    return response
