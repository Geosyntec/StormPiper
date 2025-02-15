"""add fields to tmnt view

Revision ID: 45d7df351282
Revises: a7a5adc4b191
Create Date: 2022-06-28 20:57:43.937847

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "45d7df351282"
down_revision = "a7a5adc4b191"
branch_labels = None
depends_on = None


def upgrade():
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
            GEOMETRY(tmnt_facility.geom) AS geom
        FROM tmnt_facility
        JOIN tmnt_facility_attributes ON tmnt_facility.altid = tmnt_facility_attributes.altid
    """
    )


def downgrade():
    op.execute(
        """
        DROP VIEW IF EXISTS tmnt_v;
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
            GEOMETRY(tmnt_facility.geom) AS geom
        FROM tmnt_facility
        JOIN tmnt_facility_attributes ON tmnt_facility.altid = tmnt_facility_attributes.altid
    """
    )
