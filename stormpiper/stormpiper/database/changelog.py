import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from stormpiper.core import utils
from stormpiper.database.schemas.changelog import TableChangeLog


def sync_log(
    *,
    tablename: str,
    db: Session,
    changelog: TableChangeLog = TableChangeLog,  # type: ignore
) -> None:
    result = db.execute(sa.select(changelog).where(changelog.tablename == tablename))  # type: ignore
    ls = result.scalars().all()
    exists = len(ls) >= 1
    ts = utils.datetime_now()

    if exists:
        q = (
            sa.update(changelog)  # type: ignore
            .where(changelog.tablename == tablename)
            .values(last_updated=ts)
        )

    else:
        q = sa.insert(changelog).values(tablename=tablename)  # type: ignore

    db.execute(q)

    return None


async def async_log(
    *,
    tablename: str,
    db: AsyncSession,
    changelog: TableChangeLog = TableChangeLog,  # type: ignore
) -> None:
    result = await db.execute(
        sa.select(changelog).where(changelog.tablename == tablename)  # type: ignore
    )
    ls = result.scalars().all()
    exists = len(ls) >= 1
    ts = utils.datetime_now()

    if exists:
        q = (
            sa.update(changelog)  # type: ignore
            .where(changelog.tablename == tablename)
            .values(last_updated=ts)
        )
    else:
        q = sa.insert(changelog).values(tablename=tablename)  # type: ignore
    await db.execute(q)
    await db.commit()

    return None
