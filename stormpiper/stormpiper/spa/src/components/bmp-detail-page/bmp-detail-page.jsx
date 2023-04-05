import { Card, Grid } from "@mui/material";

import { BMPDetailResults } from "./bmp-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import BMPDetailMap from "./bmp-detail-map";
import { BMPDetailForm } from "./bmp-detail-form";

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
                alignItems: "start",
                justifyContent: "center",
              }}
            >
              <BMPDetailForm />
            </Card>
          </Grid>
          {/* <Grid item flexGrow={1}>
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
          </Grid> */}
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
      </FullSpan>
      <FullSpan>
        <BMPDetailResults />
      </FullSpan>
    </TwoColGrid>
  );
}
