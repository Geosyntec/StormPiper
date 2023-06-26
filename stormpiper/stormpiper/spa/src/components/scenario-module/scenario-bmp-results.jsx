import { Box, Card, Stack, Typography } from "@mui/material";

import BMPVolumeBalance from "../bmp-detail-page/bmp-results-volume";
import BMPLoadReduction from "../bmp-detail-page/bmp-results-load";
import BMPConcReduction from "../bmp-detail-page/bmp-results-conc";

const prepLoadPctRemovedData = (x) => {
  const pocs = ["TSS", "TN", "TP", "TCu", "TZn", "PYR", "PHE", "DEHP"];
  pocs.forEach((poc) => {
    x[`${poc}_load_pct_removed`] =
      100 * (x[`${poc}_load_lbs_removed`] / x[`${poc}_load_lbs_inflow`]);
  });
  return x;
};

const prepLoadRemovedData = (x) => {
  const lbs_to_grams = ["TCu", "TZn", "PYR", "PHE", "DEHP"];
  lbs_to_grams.forEach((poc) => {
    x[`${poc}_load_g_removed`] = 453.592 * x[`${poc}_load_lbs_removed`];
  });
  return x;
};

const prepConcData = (x) => {
  const lbs_to_grams = ["TN", "TP", "PYR", "PHE", "DEHP"];
  lbs_to_grams.forEach((poc) => {
    x[`${poc}_conc_ug/l_influent`] = 1e3 * x[`${poc}_conc_mg/l_influent`];
    x[`${poc}_conc_ug/l_effluent`] = 1e3 * x[`${poc}_conc_mg/l_effluent`];
  });
  return x;
};

const prepConcPctRemovedData = (x) => {
  const pocs = ["TSS", "TN", "TP", "PYR", "PHE", "DEHP"];
  pocs.forEach((poc) => {
    x[`${poc}_conc_pct_removed`] =
      100 *
      ((x[`${poc}_conc_mg/l_influent`] - x[`${poc}_conc_mg/l_effluent`]) /
        x[`${poc}_conc_mg/l_influent`]);
  });

  const pocs_ugl = ["TCu", "TZn"];
  pocs_ugl.forEach((poc) => {
    x[`${poc}_conc_pct_removed`] =
      100 *
      ((x[`${poc}_conc_ug/l_influent`] - x[`${poc}_conc_ug/l_effluent`]) /
        x[`${poc}_conc_ug/l_influent`]);
  });
  return x;
};

export function ScenarioBMPDetailResults({ data }) {
  let rows = [];

  const tmnt_facility_info = data?.structural_tmnt?.[0];
  const node_id = tmnt_facility_info?.node_id;
  const all_results = data?.structural_tmnt_result || [];
  const bmp_results = all_results.filter((x) => x?.node_id === node_id);
  if (bmp_results.length > 0) {
    bmp_results.forEach((r) => {
      prepLoadRemovedData(r);
      prepLoadPctRemovedData(r);
      prepConcPctRemovedData(r);
      prepConcData(r);
    });
    rows = bmp_results;
  }

  return (
    <Box>
      {node_id == null ? (
        <Card sx={{ p: 2 }}>
          <Typography>No treatment BMP included in Scenario</Typography>
        </Card>
      ) : (
        <Box>
          {!rows.length ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" textAlign="center">
                BMP Water Quality Results Are Unavailable for This Facility
              </Typography>
            </Card>
          ) : (
            <Stack spacing={2}>
              <Card sx={{ p: 2 }}>
                {
                  <Box>
                    <Typography>
                      Performance Results for Treatment Facility:{" "}
                      <b>{node_id || "--"}</b>
                    </Typography>
                    <BMPVolumeBalance rows={rows} />
                  </Box>
                }
              </Card>
              <Card sx={{ p: 2 }}>{<BMPLoadReduction rows={rows} />}</Card>
              <Card sx={{ p: 2 }}>{<BMPConcReduction rows={rows} />}</Card>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
