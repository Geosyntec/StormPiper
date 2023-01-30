"""refactor npv tables

Revision ID: f4bc4f04ff46
Revises: 79b569f8c17a
Create Date: 2023-01-27 10:29:20.078876

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "f4bc4f04ff46"
down_revision = "79b569f8c17a"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###

    op.execute("DROP VIEW IF EXISTS tmnt_v")

    op.alter_column("tmnt_facility", "node_id", nullable=False, unique=True)

    op.rename_table("tmnt_facility_attributes", "tmnt_facility_attribute")
    op.drop_column("tmnt_facility_attribute", "capital_cost")
    op.drop_column("tmnt_facility_attribute", "om_cost_per_yr")
    op.drop_column("tmnt_facility_attribute", "lifespan_yrs")
    op.drop_column("tmnt_facility_attribute", "replacement_cost")
    op.drop_column("tmnt_facility_attribute", "net_present_value")

    op.add_column(
        "tmnt_facility_attribute",
        sa.Column("node_id", sa.String(), nullable=True),
    )

    op.create_table(
        "tmnt_facility_cost",
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_by", sa.String(), nullable=True),
        sa.Column("node_id", sa.String(), nullable=False),
        sa.Column("capital_cost", sa.Float(), nullable=True),
        sa.Column("om_cost_per_yr", sa.Float(), nullable=True),
        sa.Column("lifespan_yrs", sa.Float(), nullable=True),
        sa.Column("replacement_cost", sa.Float(), nullable=True),
        sa.Column("net_present_value", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("node_id"),
    )

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###

    op.drop_table("tmnt_facility_cost")
    op.alter_column("tmnt_facility", "node_id", nullable=True, unique=False)

    op.rename_table("tmnt_facility_attribute", "tmnt_facility_attributes")
    op.drop_column("tmnt_facility_attributes", "node_id")
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column("capital_cost", sa.Float(), nullable=True),
    )
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column("om_cost_per_yr", sa.Float(), nullable=True),
    )
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column("lifespan_yrs", sa.Float(), nullable=True),
    )
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column("replacement_cost", sa.Float(), nullable=True),
    )
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column("net_present_value", sa.Float(), nullable=True),
    )

    # ### end Alembic commands ###
