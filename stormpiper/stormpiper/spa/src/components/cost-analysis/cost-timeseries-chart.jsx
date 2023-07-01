import { useEffect, useRef } from "react";
import embed from "vega-embed";
import { Box } from "@mui/material";

import { api_fetch } from "../../utils/utils";

export default function CostTimeseriesChart({
  node_id,
  data_values,
  ...props
}) {
  const id = `cost_timeseries_chart_${node_id || ""}`;
  let ref = useRef();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      window.dispatchEvent(new Event("resize"));
    });
    observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

  useEffect(async () => {
    const response = await api_fetch(`/api/rest/chart/cost_timeseries`);
    const spec = await response.json();
    if (data_values.length > 0) {
      spec.data = { values: data_values };
      await embed("#" + id, spec);
    }
  }, [data_values, node_id]);

  return <Box ref={ref} id={id} sx={{ width: "100%" }} {...props}></Box>;
}
