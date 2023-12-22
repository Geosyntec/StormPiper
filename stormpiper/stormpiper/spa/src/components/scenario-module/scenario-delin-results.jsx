import { Box, Card, Typography } from "@mui/material";
import DelineationLoadGenerated from "./scenario-delin-results-load";

const prepLoadData = (x) => {
  const lbs_to_grams = ["TCu", "TZn", "PYR", "PHE", "DEHP"];
  lbs_to_grams.forEach((poc) => {
    x[`${poc}_g`] = 453.592 * x[`${poc}_lbs`];
  });
  return x;
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

  if (delinLoadResultWide.length > 0) {
    delinLoadResultWide.forEach((r) => {
      prepLoadData(r);
    });
    rows = delinLoadResultWide;
  }

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        {node_id == null ? (
          <Typography>No delineation feature included in Scenario</Typography>
        ) : (
          <>
            {!rows.length ? (
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" textAlign="center">
                  Water Quality Results Are Unavailable for This Delineation
                </Typography>
              </Card>
            ) : (
              <>
                <Typography>
                  Loading Results for Delineation Name: <b>{name || "--"}</b>
                </Typography>
                <Box>
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
