"""patch tmnt_v geom type

Revision ID: 508290ea6fd4
Revises: 2e742609bbf1
Create Date: 2022-05-31 17:00:50.287075

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "508290ea6fd4"
down_revision = "2e742609bbf1"
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
            ST_AsEWKB(tmnt_facility.geom) AS geom
        FROM tmnt_facility
        JOIN tmnt_facility_attributes ON tmnt_facility.altid = tmnt_facility_attributes.altid
    """
    )
