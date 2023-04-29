import { Box, Card, Typography } from "@mui/material";

// import BMPVolumeBalance from "../bmp-detail-page/bmp-results-volume";
// import BMPLoadReduction from "../bmp-detail-page/bmp-results-load";
// import BMPConcReduction from "../bmp-detail-page/bmp-results-conc";

import DelineationLoadGenerated from "./scenario-delin-results-load";

// const prepLoadPctRemovedData = (x) => {
//   const pocs = ["TSS", "TN", "TP", "TCu", "TZn", "PYR", "PHE", "DEHP"];
//   pocs.forEach((poc) => {
//     x[`${poc}_load_pct_removed`] =
//       100 * (x[`${poc}_load_lbs_removed`] / x[`${poc}_load_lbs_inflow`]);
//   });
//   return x;
// };

const prepLoadData = (x) => {
  const lbs_to_grams = ["TCu", "TZn", "PYR", "PHE", "DEHP"];
  lbs_to_grams.forEach((poc) => {
    x[`${poc}_g`] = 453.592 * x[`${poc}_lbs`];
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

export function ScenarioDelineationDetailResults({ data }) {
  let rows = [];

  const delineation_collection = data?.input?.delineation_collection || {};
  const delin_props = delineation_collection?.features?.[0]?.properties || {};
  const { name, altid, node_id, area_acres, ..._ } = delin_props;

  const delinLoadResultsAll = data?.delin_load || [];

  const delinLoadResultWide = [];

  const epochs = ["1980s", "2030s", "2050s", "2080s"];
  const altids = [altid];
  const pocs = [
    "runoff",
    "TSS",
    "TN",
    "TP",
    "TCu",
    "TZn",
    "PYR",
    "PHE",
    "DEHP",
  ];

  if (data?.delin_load && altids[0]) {
    for (let id of altids) {
      for (let e of epochs) {
        let d = { altid: id, epoch: e };
        const d_list = delinLoadResultsAll.filter(
          (x) => x.altid === id && x.epoch === e
        );
        for (let poc of pocs) {
          const poc_data = d_list.find((x) => x.variable === poc);
          const col = `${poc}_${poc_data.units}`;
          d[col] = poc_data.value;
        }
        delinLoadResultWide.push(d);
      }
    }
  }

  console.log("wide delin results", delinLoadResultWide);

  if (delinLoadResultWide.length > 0) {
    delinLoadResultWide.forEach((r) => {
      prepLoadData(r);
      // prepLoadPctRemovedData(r);
      // prepConcPctRemovedData(r);
    });
    rows = delinLoadResultWide;
  }

  const lastCalculatedAt = data?.result_time_updated;
  const formattedLastCalculatedAt = dateFormatter(lastCalculatedAt);

  return (
    <Card>
      <Typography>
        Loading Results for Delineation Name: <b>{name || "--"}</b>
      </Typography>

      <Box>
        {node_id == null ? (
          <Typography>
            No delineation feature is included in Scenario.
          </Typography>
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
                <Typography>
                  Results Last Generated:{" "}
                  <b>{formattedLastCalculatedAt || "--"}</b>
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <DelineationLoadGenerated rows={rows} />
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}
