"""update results_blob

Revision ID: fe5b9391ee82
Revises: 413970fe67a0
Create Date: 2023-06-08 13:20:44.446756

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "fe5b9391ee82"
down_revision = "413970fe67a0"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "result_blob",
        sa.Column("runoff_volume_cuft", sa.Float(), nullable=True),
    )
    op.add_column(
        "result_blob",
        sa.Column("runoff_volume_cuft_total_discharged", sa.Float(), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("result_blob", "runoff_volume_cuft_total_discharged")
    op.drop_column("result_blob", "runoff_volume_cuft")
    # ### end Alembic commands ###
