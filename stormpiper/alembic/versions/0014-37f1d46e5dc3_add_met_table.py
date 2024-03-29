"""add met table

Revision ID: 37f1d46e5dc3
Revises: 1e4880ca4cb7
Create Date: 2022-07-13 13:46:25.001962

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "37f1d46e5dc3"
down_revision = "1e4880ca4cb7"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "met",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("epoch", sa.String(), nullable=True),
        sa.Column("mean_annual_precip_depth_inches", sa.Float(), nullable=True),
        sa.Column("design_storm_precip_depth_inches", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("met")
    # ### end Alembic commands ###
