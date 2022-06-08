"""default users role

Revision ID: e225ccb368e1
Revises: 2e72fb6d5867
Create Date: 2022-06-06 16:32:43.359063

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e225ccb368e1"
down_revision = "2e72fb6d5867"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("users", "role", server_default="none")


def downgrade():
    op.alter_column("users", "role", server_default=None)
