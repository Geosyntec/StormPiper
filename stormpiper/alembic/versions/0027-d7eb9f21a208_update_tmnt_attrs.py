"""update tmnt attrs

Revision ID: d7eb9f21a208
Revises: 47e1f95064c8
Create Date: 2023-01-02 23:20:25.581537

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "d7eb9f21a208"
down_revision = "47e1f95064c8"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###

    op.execute(
        """
        DROP VIEW IF EXISTS tmnt_v;
        CREATE OR REPLACE VIEW tmnt_v AS
        select
            t."altid",
            t."node_id",
            t."commonname",
            t."facilitytype",
            t."facilitydetail",
            t."flowcontrol",
            t."infiltrated",
            t."waterquality",
            t."flowcontroltype",
            t."waterqualitytype",
            t."geom",
            ta."time_created",
            ta."time_updated",
            ta."updated_by",
            ta."basinname",
            ta."subbasin",
            ta."facility_type",
            ta."hsg",
            ta."design_storm_depth_inches",
            ta."tributary_area_tc_min",
            ta."total_volume_cuft",
            ta."area_sqft",
            ta."inf_rate_inhr",
            ta."retention_volume_cuft",
            ta."media_filtration_rate_inhr",
            ta."minimum_retention_pct_override",
            ta."treatment_rate_cfs",
            ta."depth_ft",
            ta."captured_pct",
            ta."retained_pct",
            ta."capital_cost",
            ta."om_cost_per_yr",
            ta."lifespan_yrs",
            ta."replacement_cost",
            ta."net_present_value"
        from tmnt_facility as t JOIN tmnt_facility_attributes as ta on t.altid = ta.altid
        """
    )

    op.drop_column("tmnt_facility_attributes", "treatment_strategy")
    op.drop_column("tmnt_facility_attributes", "ref_data_key")

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column("ref_data_key", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "tmnt_facility_attributes",
        sa.Column(
            "treatment_strategy",
            sa.VARCHAR(),
            autoincrement=False,
            nullable=True,
        ),
    )

    op.execute(
        """
        DROP VIEW IF EXISTS tmnt_v;
        CREATE OR REPLACE VIEW tmnt_v AS
        SELECT
            tmnt_facility.id,
            tmnt_facility.node_id,
            tmnt_facility.altid,
            tmnt_facility.facilitytype,
            tmnt_facility.commonname,
            tmnt_facility.facilitydetail,
            tmnt_facility.flowcontrol,
            tmnt_facility.infiltrated,
            tmnt_facility.waterquality,
            tmnt_facility.flowcontroltype,
            tmnt_facility.waterqualitytype,
            tmnt_facility_attributes.basinname,
            tmnt_facility_attributes.subbasin,
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
            tmnt_facility_attributes.capital_cost,
            tmnt_facility_attributes.om_cost_per_yr,
            tmnt_facility_attributes.lifespan_yrs,
            tmnt_facility_attributes.replacement_cost,
            tmnt_facility_attributes.net_present_value,
            GEOMETRY(tmnt_facility.geom) AS geom
        FROM tmnt_facility
        JOIN tmnt_facility_attributes ON tmnt_facility.altid = tmnt_facility_attributes.altid
    """
    )
    # ### end Alembic commands ###