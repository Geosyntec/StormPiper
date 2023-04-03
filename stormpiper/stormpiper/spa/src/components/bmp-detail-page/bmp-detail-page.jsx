import { Card, Grid } from "@mui/material";

import { BMPDetailResults } from "./bmp-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import BMPDetailMap from "./bmp-detail-map";

export default function BMPDetailPage() {
  return (
    <TwoColGrid>
      <FullSpan item container spacing={3}>
        <HalfSpan container spacing={3} direction="column">
          <Grid item flexGrow={1}>
            <Card
              sx={{
                // padding: 3,
                display: "flex",
                height: "100%",
                minHeight: "200px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              form placeholder
            </Card>
          </Grid>
          <Grid item flexGrow={1}>
            <Card
              sx={{
                // padding: 3,
                display: "flex",
                height: "100%",
                minHeight: "200px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              delin editor placeholder
            </Card>
          </Grid>
        </HalfSpan>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              height: "500px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BMPDetailMap></BMPDetailMap>
          </Card>
        </HalfSpan>
      </FullSpan>
      <FullSpan>
        <BMPDetailResults />
      </FullSpan>
    </TwoColGrid>
  );
}
