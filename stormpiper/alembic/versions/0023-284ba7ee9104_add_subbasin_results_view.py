"""add subbasin results view

Revision ID: 284ba7ee9104
Revises: 880c6f2e655b
Create Date: 2022-12-29 15:28:28.050899

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "284ba7ee9104"
down_revision = "880c6f2e655b"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        DROP VIEW IF EXISTS subbasinresult_v;
        CREATE OR REPLACE VIEW subbasinresult_v AS
        select
            s."basinname",
            s."subbasin",
            s."area_acres",
            s."access",
            s."economic_value",
            s."environmental_value",
            s."livability_value",
            s."opportunity_value",
            s."geom",
            sr."node_id",
            sr."epoch",
            sr."runoff_volume_cuft",
            sr."TCu_load_lbs",
            sr."TN_load_lbs",
            sr."TP_load_lbs",
            sr."TSS_load_lbs",
            sr."TZn_load_lbs",
            sr."PHE_load_lbs",
            sr."PYR_load_lbs",
            sr."DEHP_load_lbs",
            sr."runoff_volume_cuft" * 0.0002754821 / s.area_acres as "runoff_depth_inches",
            sr."TCu_load_lbs" / s.area_acres as "TCu_yield_lbs_per_acre",
            sr."TN_load_lbs" / s.area_acres as "TN_yield_lbs_per_acre",
            sr."TP_load_lbs" / s.area_acres as "TP_yield_lbs_per_acre",
            sr."TSS_load_lbs" / s.area_acres as "TSS_yield_lbs_per_acre",
            sr."TZn_load_lbs" / s.area_acres as "TZn_yield_lbs_per_acre",
            sr."PHE_load_lbs" / s.area_acres as "PHE_yield_lbs_per_acre",
            sr."PYR_load_lbs" / s.area_acres as "PYR_yield_lbs_per_acre",
            sr."DEHP_load_lbs" / s.area_acres as "DEHP_yield_lbs_per_acre"
        from subbasin_result as sr JOIN subbasin as s on sr.subbasin = s.subbasin
        """
    )
    pass


def downgrade():
    op.execute("DROP VIEW IF EXISTS subbasinresult_v")
