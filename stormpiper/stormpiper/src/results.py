from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from stormpiper.database.schemas import changelog
from stormpiper.database.utils import orm_to_dict, scalars_to_records


async def is_dirty(db: AsyncSession):
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
        return True  # it's dirty if there are no results

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

    return any(i["last_updated"] > res_updated for i in other_records)
