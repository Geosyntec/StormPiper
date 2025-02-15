"""rename access_token to readonly_token on user table

Revision ID: 95dce7183719
Revises: 61a221884a60
Create Date: 2023-01-08 11:41:18.143517

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "95dce7183719"
down_revision = "61a221884a60"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "user", "access_token", new_column_name="readonly_token", nullable=True
    )


def downgrade():
    op.alter_column(
        "user", "readonly_token", new_column_name="access_token", nullable=True
    )
