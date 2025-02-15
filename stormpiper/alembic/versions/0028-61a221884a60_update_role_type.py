"""update role type

Revision ID: 61a221884a60
Revises: d7eb9f21a208
Create Date: 2023-01-07 14:22:35.420414

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "61a221884a60"
down_revision = "d7eb9f21a208"
branch_labels = None
depends_on = None


name = "role"
tmp_name = "tmp_" + name

old_options = ("none", "public", "user", "editor", "admin")
new_options = ("none", "public", "reader", "user", "editor", "user_admin", "admin")

new_type = sa.Enum(*new_options, name=name)
old_type = sa.Enum(*old_options, name=name)


def upgrade():
    op.execute(f"ALTER TYPE {name} RENAME TO {tmp_name}")

    new_type.create(op.get_bind())
    op.execute(
        f"""
    ALTER TABLE "user"
        ALTER COLUMN role DROP DEFAULT,
        ALTER COLUMN role TYPE {name} USING "role"::text::{name},
        ALTER COLUMN role SET DEFAULT 'public'::role;
    """
    )
    op.execute(f"DROP TYPE {tmp_name}")


def downgrade():
    tcr = sa.sql.table("user", sa.Column("role", new_type, nullable=True))
    # Convert 'output_limit_exceeded' status into 'timed_out'
    op.execute(tcr.update().where(tcr.c.role == "user_admin").values(role="editor"))
    op.execute(tcr.update().where(tcr.c.role == "reader").values(role="public"))
    op.execute(tcr.update().where(tcr.c.role == None).values(role="none"))  # noqa

    op.execute(f"ALTER TYPE {name} RENAME TO {tmp_name}")

    old_type.create(op.get_bind())
    op.execute(
        f"""
    ALTER TABLE "user"
        ALTER COLUMN role DROP DEFAULT,
        ALTER COLUMN role TYPE {name} USING "role"::text::{name},
        ALTER COLUMN role SET DEFAULT 'none'::role;
    """
    )
    op.execute(f"DROP TYPE {tmp_name}")
