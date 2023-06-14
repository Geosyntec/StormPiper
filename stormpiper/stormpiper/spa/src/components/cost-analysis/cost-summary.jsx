import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import CostTimeseriesChart from "./cost-timeseries-chart";
import { api_fetch } from "../../utils/utils";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function moneyFormatter(val) {
  if (val == null) return "--";
  const n = Math.round(val).toLocaleString();
  return `$${n}`;
}

function CostDetails({ tmntDetails }) {
  const data = [
    {
      variable: "Present Value Capital Cost",
      value: tmntDetails?.present_value_capital_cost,
    },
    {
      variable: "Present Value O&M Cost",
      value: tmntDetails?.present_value_om_cost,
    },
    {
      variable: "Present Value Total Cost",
      value: tmntDetails?.present_value_total_cost,
    },
  ];
  return (
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Typography variant="h6">Lifetime Costs</Typography>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12, lg: 12 }}
      >
        {data.map((d, index) => (
          <Grid item xs={2} sm={4} md={4} key={index}>
            <Item>
              <Typography fontWeight="bold">{d.variable}</Typography>
              <Typography>{moneyFormatter(d.value)}</Typography>
            </Item>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function CostEffectivenessDetails({ tmntDetails }) {
  const pocs = ["TSS", "TN", "TP", "TCu", "TZn", "PYR", "PHE", "DEHP"];

  const data = pocs.map((poc) => {
    return {
      variable: `${poc} Removal Cost ($/lb)`,
      value: tmntDetails?.[`${poc}_total_cost_dollars_per_load_lbs_removed`],
    };
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h6">Cost Effectiveness</Typography>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12, lg: 12 }}
      >
        {data.map((d, index) => (
          <Grid item xs={2} sm={4} md={4} lg={3} key={index}>
            <Item>
              <Typography fontWeight="bold">{d.variable}</Typography>
              <Typography>{moneyFormatter(d.value)}</Typography>
            </Item>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default function CostSummary({
  tmntDetails,
  updateFacilityData,
  ...props
}) {
  const hasData = tmntDetails?.present_value_total_cost != null;

  async function refreshCostAnalysisByID() {
    await api_fetch(`/api/rpc/calculate_present_cost/${tmntDetails.node_id}`, {
      method: "POST",
    });
    await updateFacilityData();
  }

  return (
    <Box {...props}>
      <Box
        display={"flex"}
        flexGrow={1}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant="h6">Lifecycle Cost Analysis</Typography>
        {hasData && (
          <Tooltip title="Refresh Cost Analysis">
            <IconButton onClick={refreshCostAnalysisByID} color="primary">
              <AutorenewIcon sx={{ fontSize: "2rem" }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {hasData && (
        <Box sx={{ pt: 2 }}>
          <CostTimeseriesChart
            node_id={tmntDetails?.node_id || ""}
            data_values={tmntDetails?.present_value_chart_table || []}
          />
          <CostDetails tmntDetails={tmntDetails || {}} />
          <CostEffectivenessDetails tmntDetails={tmntDetails || {}} />
        </Box>
      )}
      {!hasData && (
        <Typography
          variant="body1"
          textAlign="center"
          fontStyle="italic"
          color={(theme) => theme.palette.grey[600]}
        >
          Lifecycle costs are unavailable for this facility.
          <br />
          This usually means that the "Cost Analysis Parameters" are incomplete.
        </Typography>
      )}
    </Box>
  );
}
