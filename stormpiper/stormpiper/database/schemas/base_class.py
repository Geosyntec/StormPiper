import sqlalchemy as sa
from sqlalchemy.ext.declarative import as_declarative


@as_declarative()
class Base:
    pass


class TrackedTable:
    id = sa.Column(sa.Integer)
    time_created = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())
    time_updated = sa.Column(sa.DateTime(timezone=True), onupdate=sa.func.now())
    updated_by = sa.Column(sa.String)

    def __repr__(self):
        rep = f"{self.__class__.__name__}(id={self.id})"
        return rep
