import datetime

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from stormpiper.core import utils
from stormpiper.database.schemas.base import Base, TableChangeLog


def sync_log(*, tablename: str, db: Session, changelog: Base = TableChangeLog):

    result = db.execute(sa.select(changelog).where(changelog.tablename == tablename))
    ls = result.scalars().all()
    exists = len(ls) >= 1
    ts = utils.datetime_now()

    if exists:
        q = (
            sa.update(changelog)
            .where(changelog.tablename == tablename)
            .values(last_updated=ts)
        )

    else:
        q = sa.insert(changelog).values(tablename=tablename)

    db.execute(q)
    db.commit()


async def async_log(
    *, tablename: str, db: AsyncSession, changelog: Base = TableChangeLog
):
    result = await db.execute(
        sa.select(changelog).where(changelog.tablename == tablename)
    )
    ls = result.scalars().all()
    exists = len(ls) >= 1
    ts = utils.datetime_now()

    if exists:
        q = (
            sa.update(changelog)
            .where(changelog.tablename == tablename)
            .values(last_updated=ts)
        )
    else:
        q = sa.insert(changelog).values(tablename=tablename)
    await db.execute(q)
    await db.commit()
