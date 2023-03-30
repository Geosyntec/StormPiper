import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Card } from "@mui/material";

import { api_fetch } from "../../utils/utils";
import BMPVolumeBalance from "./bmp-results-volume";
import BMPLoadReduction from "./bmp-results-load";
import BMPConcReduction from "./bmp-results-conc";

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

async function getDataByID(id) {
  const response = await api_fetch(`/api/rest/results/${id}`);
  return response.json();
}

export function BMPDetailResults() {
  const params = useParams();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getDataByID(params.id).then((res) => {
      res.forEach((r) => {
        prepLoadRemovedData(r);
        prepLoadPctRemovedData(r);
        prepConcPctRemovedData(r);
      });
      setRows(res);
    });
  }, [params.id]);

  return (
    <Card>
      <Box>
        {!rows.length ? (
          "loading..."
        ) : (
          <>
            <Box>
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
      </Box>
    </Card>
  );
}
