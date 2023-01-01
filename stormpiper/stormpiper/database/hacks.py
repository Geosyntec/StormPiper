import uuid

from pydantic import UUID4
from sqlalchemy import CHAR, TypeDecorator, event, inspect
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext import compiler
from sqlalchemy.schema import DDLElement
from sqlalchemy.sql import table


class CreateView(DDLElement):
    def __init__(self, name, selectable):
        self.name = name
        self.selectable = selectable


class DropView(DDLElement):
    def __init__(self, name):
        self.name = name


@compiler.compiles(CreateView)
def _create_view(element, compiler, **kw):
    return "CREATE VIEW %s AS %s" % (
        element.name,
        compiler.sql_compiler.process(element.selectable, literal_binds=True),
    )


@compiler.compiles(DropView)
def _drop_view(element, compiler, **kw):
    return "DROP VIEW %s" % (element.name)


def view_exists(ddl, target, connection, **kw):
    return ddl.name in inspect(connection).get_view_names()


def view_doesnt_exist(ddl, target, connection, **kw):
    return not view_exists(ddl, target, connection, **kw)


def view(name, metadata, selectable):
    t = table(name)

    t._columns._populate_separate_keys(  # type: ignore
        col._make_proxy(t) for col in selectable.selected_columns
    )

    event.listen(
        metadata,
        "after_create",
        CreateView(name, selectable).execute_if(callable_=view_doesnt_exist),  # type: ignore
    )
    event.listen(
        metadata, "before_drop", DropView(name).execute_if(callable_=view_exists)  # type: ignore
    )
    return t


class GUID(TypeDecorator):  # pragma: no cover
    """
    Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(36), storing as regular strings.
    """

    class UUIDChar(CHAR):
        python_type = UUID4  # type: ignore

    impl = UUIDChar
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))  # type: ignore
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value
