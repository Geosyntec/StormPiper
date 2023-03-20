from fastapi import APIRouter, Depends

from stormpiper.apps.supersafe.users import user_role_ge_reader
from stormpiper.database.dependencies import async_is_dirty

from ..depends import AsyncSessionDB

router = APIRouter(dependencies=[Depends(user_role_ge_reader)])


@router.get("/{tablename}/is_dirty", name="results:get_result_is_dirty")
async def get_table_is_dirty(
    tablename: str,
    db: AsyncSessionDB,
):
    response = {"is_dirty": True, "last_updated": "0"}

    is_dirty, last_updated = await async_is_dirty(tablename=tablename, db=db)

    response["is_dirty"] = is_dirty
    response["last_updated"] = last_updated

    return response
