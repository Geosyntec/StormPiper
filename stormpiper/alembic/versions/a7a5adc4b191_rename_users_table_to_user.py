"""rename users table to user

Revision ID: a7a5adc4b191
Revises: e225ccb368e1
Create Date: 2022-06-06 18:02:36.812329

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "a7a5adc4b191"
down_revision = "e225ccb368e1"
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table("users", "user")
    op.execute("ALTER INDEX ix_users_email RENAME TO ix_user_email")
    op.execute("ALTER INDEX users_pkey RENAME TO user_pkey")


def downgrade():
    op.rename_table("user", "users")
    op.execute("ALTER INDEX ix_user_email RENAME TO ix_users_email")
    op.execute("ALTER INDEX user_pkey RENAME TO users_pkey")
