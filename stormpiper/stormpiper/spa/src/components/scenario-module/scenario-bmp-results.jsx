import { Box, Card, Typography } from "@mui/material";

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

const dateFormatter = (dtValue) => {
  if (dtValue == null) {
    return "--";
  }
  const valueDate = new Date(dtValue);
  const valueLocale = valueDate.toLocaleString("en-US", {
    timeZoneName: "short",
  });
  const [date, time, ..._] = valueLocale.split(",");
  return `${date.trim()} at ${time.trim()}`;
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
    });
    rows = bmp_results;
  }

  const lastCalculatedAt = data?.result_time_updated;
  const formattedLastCalculatedAt = dateFormatter(lastCalculatedAt);

  return (
    <Card>
      <Typography>
        Last updated at: <em>{formattedLastCalculatedAt}</em>
      </Typography>
      <Box>
        {node_id == null ? (
          <Typography>No Treatment BMP included in Scenario.</Typography>
        ) : (
          <>
            {!rows.length ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <Typography>
                  Performance Results for Treatment Facility:{" "}
                  <b>{node_id || "--"}</b>
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <BMPVolumeBalance rows={rows} />
                </Box>
                <Box sx={{ mt: 4 }}>
                  <BMPLoadReduction rows={rows} />
                </Box>
                <Box sx={{ mt: 4 }}>
                  <BMPConcReduction rows={rows} />
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}
