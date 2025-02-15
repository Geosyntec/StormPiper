import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase  # type: ignore ; pylance import bug.


class Base(DeclarativeBase): ...


class TrackedTable:
    time_created = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())

    def __repr__(self):
        id = getattr(self, "id", "not_implemented")
        rep = f"{self.__class__.__name__}(id={id})"
        return rep


class MutableTrackedTable(TrackedTable):
    time_updated = sa.Column(sa.DateTime(timezone=True), onupdate=sa.func.now())
    updated_by = sa.Column(sa.String)
