"""results view init

Revision ID: 1e4880ca4cb7
Revises: 264be46bf23a
Create Date: 2022-07-13 11:12:22.357535

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "1e4880ca4cb7"
down_revision = "264be46bf23a"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        DROP VIEW IF EXISTS result_v;
        CREATE OR REPLACE VIEW result_v AS
        SELECT
            result_blob.node_id AS "id",
            result_blob.epoch AS "epoch_id",
            result_blob.blob -> '_version' AS "_version",
            result_blob.blob -> '_config_version' AS "_config_version",
            result_blob.blob -> 'node_id' AS "node_id",
            result_blob.blob -> 'facility_type' AS "facility_type",
            result_blob.blob -> 'node_type' AS "node_type",
            result_blob.blob -> 'valid_model' AS "valid_model",
            result_blob.blob -> 'design_intensity_inhr' AS "design_intensity_inhr",
            result_blob.blob -> 'design_volume_cuft_cumul' AS "design_volume_cuft_cumul",
            result_blob.blob -> 'captured_pct' AS "captured_pct",
            result_blob.blob -> 'treated_pct' AS "treated_pct",
            result_blob.blob -> 'retained_pct' AS "retained_pct",
            result_blob.blob -> 'bypassed_pct' AS "bypassed_pct",
            result_blob.blob -> 'runoff_volume_cuft_inflow' AS "runoff_volume_cuft_inflow",
            result_blob.blob -> 'runoff_volume_cuft_treated' AS "runoff_volume_cuft_treated",
            result_blob.blob -> 'runoff_volume_cuft_retained' AS "runoff_volume_cuft_retained",
            result_blob.blob -> 'runoff_volume_cuft_captured' AS "runoff_volume_cuft_captured",
            result_blob.blob -> 'runoff_volume_cuft_bypassed' AS "runoff_volume_cuft_bypassed",
            result_blob.blob -> 'TSS_load_lbs_inflow' AS "TSS_load_lbs_inflow",
            result_blob.blob -> 'TSS_load_lbs_removed' AS "TSS_load_lbs_removed",
            result_blob.blob -> 'TN_load_lbs_inflow' AS "TN_load_lbs_inflow",
            result_blob.blob -> 'TN_load_lbs_removed' AS "TN_load_lbs_removed",
            result_blob.blob -> 'TP_load_lbs_inflow' AS "TP_load_lbs_inflow",
            result_blob.blob -> 'TP_load_lbs_removed' AS "TP_load_lbs_removed",
            result_blob.blob -> 'TZn_load_lbs_inflow' AS "TZn_load_lbs_inflow",
            result_blob.blob -> 'TZn_load_lbs_removed' AS "TZn_load_lbs_removed",
            result_blob.blob -> 'TCu_load_lbs_inflow' AS "TCu_load_lbs_inflow",
            result_blob.blob -> 'TCu_load_lbs_removed' AS "TCu_load_lbs_removed",
            result_blob.blob -> 'TSS_conc_mg/l_influent' AS "TSS_conc_mg/l_influent",
            result_blob.blob -> 'TSS_conc_mg/l_effluent' AS "TSS_conc_mg/l_effluent",
            result_blob.blob -> 'TN_conc_mg/l_influent' AS "TN_conc_mg/l_influent",
            result_blob.blob -> 'TN_conc_mg/l_effluent' AS "TN_conc_mg/l_effluent",
            result_blob.blob -> 'TP_conc_mg/l_influent' AS "TP_conc_mg/l_influent",
            result_blob.blob -> 'TP_conc_mg/l_effluent' AS "TP_conc_mg/l_effluent",
            result_blob.blob -> 'TZn_conc_ug/l_influent' AS "TZn_conc_ug/l_influent",
            result_blob.blob -> 'TZn_conc_ug/l_effluent' AS "TZn_conc_ug/l_effluent",
            result_blob.blob -> 'TCu_conc_ug/l_influent' AS "TCu_conc_ug/l_influent",
            result_blob.blob -> 'TCu_conc_ug/l_effluent' AS "TCu_conc_ug/l_effluent",
            result_blob.blob -> 'area_acres' AS "area_acres",
            result_blob.blob -> 'ro_coeff' AS "ro_coeff",
            result_blob.blob -> 'eff_area_acres' AS "eff_area_acres",
            result_blob.blob -> 'TSS_load_lbs' AS "TSS_load_lbs",
            result_blob.blob -> 'TN_load_lbs' AS "TN_load_lbs",
            result_blob.blob -> 'TP_load_lbs' AS "TP_load_lbs",
            result_blob.blob -> 'TZn_load_lbs' AS "TZn_load_lbs",
            result_blob.blob -> 'TCu_load_lbs' AS "TCu_load_lbs",
            result_blob.blob -> 'TSS_conc_mg/l' AS "TSS_conc_mg/l",
            result_blob.blob -> 'TN_conc_mg/l' AS "TN_conc_mg/l",
            result_blob.blob -> 'TP_conc_mg/l' AS "TP_conc_mg/l",
            result_blob.blob -> 'TZn_conc_ug/l' AS "TZn_conc_ug/l",
            result_blob.blob -> 'TCu_conc_ug/l' AS "TCu_conc_ug/l"
        FROM result_blob
        """
    )


def downgrade():
    op.execute("DROP VIEW IF EXISTS result_v")
