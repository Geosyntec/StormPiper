"""add virtual pocs to results

Revision ID: 281db95cd456
Revises: c2304484111d
Create Date: 2022-12-27 13:54:03.834773

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "281db95cd456"
down_revision = "c2304484111d"
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
            (result_blob.blob ->> '_version')::text AS "_version",
            (result_blob.blob ->> '_config_version')::text AS "_config_version",
            (result_blob.blob ->> 'node_id')::text AS "node_id",
            (result_blob.blob ->> 'node_type')::text AS "node_type",
            (result_blob.blob ->> 'facility_type')::text AS "facility_type",
            (result_blob.blob ->> 'valid_model')::text AS "valid_model",
            (result_blob.blob ->> 'design_intensity_inhr')::float AS "design_intensity_inhr",
            (result_blob.blob ->> 'design_volume_cuft_cumul')::float AS "design_volume_cuft_cumul",
            (result_blob.blob ->> 'captured_pct')::float AS "captured_pct",
            (result_blob.blob ->> 'treated_pct')::float AS "treated_pct",
            (result_blob.blob ->> 'retained_pct')::float AS "retained_pct",
            (result_blob.blob ->> 'bypassed_pct')::float AS "bypassed_pct",
            (result_blob.blob ->> 'area_acres')::float AS "area_acres",
            (result_blob.blob ->> 'ro_coeff')::float AS "ro_coeff",
            (result_blob.blob ->> 'eff_area_acres')::float AS "eff_area_acres",
            (result_blob.blob ->> 'runoff_volume_cuft_inflow')::float AS "runoff_volume_cuft_inflow",
            (result_blob.blob ->> 'runoff_volume_cuft_treated')::float AS "runoff_volume_cuft_treated",
            (result_blob.blob ->> 'runoff_volume_cuft_retained')::float AS "runoff_volume_cuft_retained",
            (result_blob.blob ->> 'runoff_volume_cuft_captured')::float AS "runoff_volume_cuft_captured",
            (result_blob.blob ->> 'runoff_volume_cuft_bypassed')::float AS "runoff_volume_cuft_bypassed",
            (result_blob.blob ->> 'DEHP_conc_mg/l')::float AS "DEHP_conc_mg/l",
            (result_blob.blob ->> 'DEHP_load_lbs')::float AS "DEHP_load_lbs",
            (result_blob.blob ->> 'PHE_conc_mg/l')::float AS "PHE_conc_mg/l",
            (result_blob.blob ->> 'PHE_load_lbs')::float AS "PHE_load_lbs",
            (result_blob.blob ->> 'PYR_conc_mg/l')::float AS "PYR_conc_mg/l",
            (result_blob.blob ->> 'PYR_load_lbs')::float AS "PYR_load_lbs",
            (result_blob.blob ->> 'TCu_conc_ug/l')::float AS "TCu_conc_ug/l",
            (result_blob.blob ->> 'TCu_load_lbs')::float AS "TCu_load_lbs",
            (result_blob.blob ->> 'TN_conc_mg/l')::float AS "TN_conc_mg/l",
            (result_blob.blob ->> 'TN_load_lbs')::float AS "TN_load_lbs",
            (result_blob.blob ->> 'TP_conc_mg/l')::float AS "TP_conc_mg/l",
            (result_blob.blob ->> 'TP_load_lbs')::float AS "TP_load_lbs",
            (result_blob.blob ->> 'TSS_conc_mg/l')::float AS "TSS_conc_mg/l",
            (result_blob.blob ->> 'TSS_load_lbs')::float AS "TSS_load_lbs",
            (result_blob.blob ->> 'TZn_conc_ug/l')::float AS "TZn_conc_ug/l",
            (result_blob.blob ->> 'TZn_load_lbs')::float AS "TZn_load_lbs",
            (result_blob.blob ->> 'DEHP_conc_mg/l_effluent')::float AS "DEHP_conc_mg/l_effluent",
            (result_blob.blob ->> 'DEHP_conc_mg/l_influent')::float AS "DEHP_conc_mg/l_influent",
            (result_blob.blob ->> 'DEHP_load_lbs_inflow')::float AS "DEHP_load_lbs_inflow",
            (result_blob.blob ->> 'DEHP_load_lbs_removed')::float AS "DEHP_load_lbs_removed",
            (result_blob.blob ->> 'DEHP_load_lbs_total_discharged')::float AS "DEHP_load_lbs_total_discharged",
            (result_blob.blob ->> 'PHE_conc_mg/l_effluent')::float AS "PHE_conc_mg/l_effluent",
            (result_blob.blob ->> 'PHE_conc_mg/l_influent')::float AS "PHE_conc_mg/l_influent",
            (result_blob.blob ->> 'PHE_load_lbs_inflow')::float AS "PHE_load_lbs_inflow",
            (result_blob.blob ->> 'PHE_load_lbs_removed')::float AS "PHE_load_lbs_removed",
            (result_blob.blob ->> 'PHE_load_lbs_total_discharged')::float AS "PHE_load_lbs_total_discharged",
            (result_blob.blob ->> 'PYR_conc_mg/l_effluent')::float AS "PYR_conc_mg/l_effluent",
            (result_blob.blob ->> 'PYR_conc_mg/l_influent')::float AS "PYR_conc_mg/l_influent",
            (result_blob.blob ->> 'PYR_load_lbs_inflow')::float AS "PYR_load_lbs_inflow",
            (result_blob.blob ->> 'PYR_load_lbs_removed')::float AS "PYR_load_lbs_removed",
            (result_blob.blob ->> 'PYR_load_lbs_total_discharged')::float AS "PYR_load_lbs_total_discharged",
            (result_blob.blob ->> 'TCu_conc_ug/l_effluent')::float AS "TCu_conc_ug/l_effluent",
            (result_blob.blob ->> 'TCu_conc_ug/l_influent')::float AS "TCu_conc_ug/l_influent",
            (result_blob.blob ->> 'TCu_load_lbs_inflow')::float AS "TCu_load_lbs_inflow",
            (result_blob.blob ->> 'TCu_load_lbs_removed')::float AS "TCu_load_lbs_removed",
            (result_blob.blob ->> 'TCu_load_lbs_total_discharged')::float AS "TCu_load_lbs_total_discharged",
            (result_blob.blob ->> 'TN_conc_mg/l_effluent')::float AS "TN_conc_mg/l_effluent",
            (result_blob.blob ->> 'TN_conc_mg/l_influent')::float AS "TN_conc_mg/l_influent",
            (result_blob.blob ->> 'TN_load_lbs_inflow')::float AS "TN_load_lbs_inflow",
            (result_blob.blob ->> 'TN_load_lbs_removed')::float AS "TN_load_lbs_removed",
            (result_blob.blob ->> 'TN_load_lbs_total_discharged')::float AS "TN_load_lbs_total_discharged",
            (result_blob.blob ->> 'TP_conc_mg/l_effluent')::float AS "TP_conc_mg/l_effluent",
            (result_blob.blob ->> 'TP_conc_mg/l_influent')::float AS "TP_conc_mg/l_influent",
            (result_blob.blob ->> 'TP_load_lbs_inflow')::float AS "TP_load_lbs_inflow",
            (result_blob.blob ->> 'TP_load_lbs_removed')::float AS "TP_load_lbs_removed",
            (result_blob.blob ->> 'TP_load_lbs_total_discharged')::float AS "TP_load_lbs_total_discharged",
            (result_blob.blob ->> 'TSS_conc_mg/l_effluent')::float AS "TSS_conc_mg/l_effluent",
            (result_blob.blob ->> 'TSS_conc_mg/l_influent')::float AS "TSS_conc_mg/l_influent",
            (result_blob.blob ->> 'TSS_load_lbs_inflow')::float AS "TSS_load_lbs_inflow",
            (result_blob.blob ->> 'TSS_load_lbs_removed')::float AS "TSS_load_lbs_removed",
            (result_blob.blob ->> 'TSS_load_lbs_total_discharged')::float AS "TSS_load_lbs_total_discharged",
            (result_blob.blob ->> 'TZn_conc_ug/l_effluent')::float AS "TZn_conc_ug/l_effluent",
            (result_blob.blob ->> 'TZn_conc_ug/l_influent')::float AS "TZn_conc_ug/l_influent",
            (result_blob.blob ->> 'TZn_load_lbs_inflow')::float AS "TZn_load_lbs_inflow",
            (result_blob.blob ->> 'TZn_load_lbs_removed')::float AS "TZn_load_lbs_removed",
            (result_blob.blob ->> 'TZn_load_lbs_total_discharged')::float AS "TZn_load_lbs_total_discharged"
        FROM result_blob
    """
    )


def downgrade():
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
