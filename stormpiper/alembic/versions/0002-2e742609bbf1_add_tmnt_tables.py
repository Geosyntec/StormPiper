"""add tmnt tables

Revision ID: 2e742609bbf1
Revises: b990f0108dd5
Create Date: 2022-05-18 15:29:56.190157

"""
import geoalchemy2
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "2e742609bbf1"
down_revision = "b990f0108dd5"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "tmnt_facility",
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_by", sa.String(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("altid", sa.String(), nullable=True),
        sa.Column("node_id", sa.String(), nullable=True),
        sa.Column("commonname", sa.String(), nullable=True),
        sa.Column("facilitytype", sa.String(), nullable=True),
        sa.Column("facilitydetail", sa.String(), nullable=True),
        sa.Column("flowcontrol", sa.String(), nullable=True),
        sa.Column("infiltrated", sa.String(), nullable=True),
        sa.Column("waterquality", sa.String(), nullable=True),
        sa.Column("flowcontroltype", sa.String(), nullable=True),
        sa.Column("waterqualitytype", sa.String(), nullable=True),
        sa.Column("geom", geoalchemy2.types.Geometry(srid=2927), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("altid"),
    )
    op.create_table(
        "tmnt_facility_attributes",
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_by", sa.String(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("altid", sa.String(), nullable=True),
        sa.Column("treatment_strategy", sa.String(), nullable=True),
        sa.Column("facility_type", sa.String(), nullable=True),
        sa.Column("ref_data_key", sa.String(), nullable=True),
        sa.Column("hsg", sa.String(), nullable=True),
        sa.Column("design_storm_depth_inches", sa.Float(), nullable=True),
        sa.Column("tributary_area_tc_min", sa.Float(), nullable=True),
        sa.Column("total_volume_cuft", sa.Float(), nullable=True),
        sa.Column("area_sqft", sa.Float(), nullable=True),
        sa.Column("inf_rate_inhr", sa.Float(), nullable=True),
        sa.Column("retention_volume_cuft", sa.Float(), nullable=True),
        sa.Column("media_filtration_rate_inhr", sa.Float(), nullable=True),
        sa.Column("minimum_retention_pct_override", sa.Float(), nullable=True),
        sa.Column("treatment_rate_cfs", sa.Float(), nullable=True),
        sa.Column("depth_ft", sa.Float(), nullable=True),
        sa.Column("captured_pct", sa.Float(), nullable=True),
        sa.Column("retained_pct", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("altid"),
    )
    op.create_table(
        "tmnt_facility_delineation",
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("time_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_by", sa.String(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("altid", sa.String(), nullable=True),
        sa.Column("node_id", sa.String(), nullable=True),
        sa.Column("geom", geoalchemy2.types.Geometry(srid=2927), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.execute(
        """
        CREATE OR REPLACE VIEW tmnt_v AS
        SELECT
            tmnt_facility.id,
            tmnt_facility.node_id,
            tmnt_facility.altid,
            tmnt_facility.facilitytype,
            tmnt_facility_attributes.treatment_strategy,
            tmnt_facility_attributes.facility_type,
            tmnt_facility_attributes.ref_data_key,
            tmnt_facility_attributes.design_storm_depth_inches,
            tmnt_facility_attributes.tributary_area_tc_min,
            tmnt_facility_attributes.total_volume_cuft,
            tmnt_facility_attributes.area_sqft,
            tmnt_facility_attributes.inf_rate_inhr,
            tmnt_facility_attributes.retention_volume_cuft,
            tmnt_facility_attributes.media_filtration_rate_inhr,
            tmnt_facility_attributes.hsg,
            tmnt_facility_attributes.minimum_retention_pct_override,
            tmnt_facility_attributes.treatment_rate_cfs,
            tmnt_facility_attributes.depth_ft,
            tmnt_facility_attributes.captured_pct,
            tmnt_facility_attributes.retained_pct,
            ST_AsEWKB(tmnt_facility.geom) AS geom
        FROM tmnt_facility
        JOIN tmnt_facility_attributes ON tmnt_facility.altid = tmnt_facility_attributes.altid
    """
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("DROP VIEW IF EXISTS tmnt_v")
    op.drop_table("tmnt_facility_delineation")
    op.drop_table("tmnt_facility_attributes")
    op.drop_table("tmnt_facility")
    # ### end Alembic commands ###
