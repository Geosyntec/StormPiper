import { useEffect } from "react";
import embed from "vega-embed";
import { Box } from "@mui/material";

import { api_fetch } from "../../utils/utils";

export default function CostTimeseriesChart({
  node_id,
  data_values,
  ...props
}) {
  const id = `${node_id || ""}_cost_timeseries_chart`;

  useEffect(async () => {
    const response = await api_fetch(`/api/rest/chart/cost_timeseries`);
    const spec = await response.json();
    if (data_values.length > 0) {
      spec.data = { values: data_values };
      await embed("#" + id, spec);
    }
  }, [data_values, node_id]);

  return <Box id={id} sx={{ width: "100%" }} {...props}></Box>;
}
