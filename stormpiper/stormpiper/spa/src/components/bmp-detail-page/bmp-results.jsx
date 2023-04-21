import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Card, Stack, Typography } from "@mui/material";

import { api_fetch } from "../../utils/utils";
import BMPVolumeBalance from "./bmp-results-volume";
import BMPLoadReduction from "./bmp-results-load";
import BMPConcReduction from "./bmp-results-conc";
import CostSummary from "../cost-analysis/cost-summary";

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

async function getResultsDataByID(id) {
  return await api_fetch(`/api/rest/results/${id}?epoch=all`);
}

async function getFacilityDataByID(id) {
  return await api_fetch(`/api/rest/tmnt_facility/${id}`);
}

export function BMPDetailResults() {
  const params = useParams();
  const [rows, setRows] = useState([]);
  const [tmntDetails, setTmntDetails] = useState(null);

  const updateFacilityData = async () => {
    const det_response = await getFacilityDataByID(params.id);
    if (det_response.status <= 400) {
      const details = await det_response.json();
      setTmntDetails(details);
    }
  };

  useEffect(async () => {
    const res_response = await getResultsDataByID(params.id);
    if (res_response.status <= 400) {
      const res = await res_response.json();
      res.forEach((r) => {
        prepLoadRemovedData(r);
        prepLoadPctRemovedData(r);
        prepConcPctRemovedData(r);
      });
      setRows(res);
    }

    updateFacilityData();
  }, [params.id]);

  return (
    <Box>
      <Box pb={3}>
        <Card sx={{ p: 2 }}>
          <CostSummary
            tmntDetails={tmntDetails}
            updateFacilityData={updateFacilityData}
          />
        </Card>
      </Box>
      <Box>
        {!rows.length ? (
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              BMP Water Quality Results Are Unavailable for This Facility
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3}>
            <Card sx={{ p: 2 }}>{<BMPVolumeBalance rows={rows} />}</Card>
            <Card sx={{ p: 2 }}>{<BMPLoadReduction rows={rows} />}</Card>
            <Card sx={{ p: 2 }}>{<BMPConcReduction rows={rows} />}</Card>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
