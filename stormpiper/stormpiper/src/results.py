from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.database.schemas import changelog
from stormpiper.database.utils import orm_to_dict, scalars_to_records


async def is_dirty(db: AsyncSession) -> Dict[str, Any]:
    response = {"is_dirty": True, "last_updated": "0"}
    result = (
        (
            await db.execute(
                select(changelog.TableChangeLog).where(
                    changelog.TableChangeLog.tablename == "result_blob"
                )
            )
        )
        .scalars()
        .first()
    )
    if not result:
        return response  # it's dirty if there are no results

    result_record = orm_to_dict(result)
    res_updated = result_record["last_updated"]

    others = (
        (
            await db.execute(
                select(changelog.TableChangeLog).where(
                    changelog.TableChangeLog.tablename != "result_blob"
                )
            )
        )
        .scalars()
        .all()
    )
    other_records = scalars_to_records(others)
    response["is_dirty"] = any(i["last_updated"] > res_updated for i in other_records)
    response["last_updated"] = res_updated

    return response
