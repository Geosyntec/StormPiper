"""add scenario table

Revision ID: 25bcfdb42a6f
Revises: f4bc4f04ff46
Create Date: 2023-02-08 22:17:17.396439

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "25bcfdb42a6f"
down_revision = "f4bc4f04ff46"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "scenario",
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_by", sa.String(), nullable=True),
        sa.Column("id", postgresql.UUID(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("input", postgresql.JSONB(), nullable=True),
        sa.Column("input_time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("loading_hash", sa.String(), nullable=True),
        sa.Column("input_hash", sa.String(), nullable=True),
        sa.Column("result_time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lgu_boundary", postgresql.JSONB(), nullable=True),
        sa.Column("lgu_load", postgresql.JSONB(), nullable=True),
        sa.Column("delin_load", postgresql.JSONB(), nullable=True),
        sa.Column("structural_tmnt", postgresql.JSONB(), nullable=True),
        sa.Column("graph_edge", postgresql.JSONB(), nullable=True),
        sa.Column("structural_tmnt_result", postgresql.JSONB(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("scenario")
    # ### end Alembic commands ###
