"""create change log

Revision ID: 175b76dedf85
Revises: 9213ee854365
Create Date: 2022-08-01 18:00:02.005391

"""
import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = "175b76dedf85"
down_revision = "9213ee854365"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "tablechangelog",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tablename", sa.String(), nullable=True),
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_tablechangelog_tablename"),
        "tablechangelog",
        ["tablename"],
        unique=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_tablechangelog_tablename"), table_name="tablechangelog")
    op.drop_table("tablechangelog")
    # ### end Alembic commands ###