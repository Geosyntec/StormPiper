import { Box, Card } from "@mui/material";

import { BMPDetailResults } from "./bmp-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import BMPDetailMap from "./bmp-detail-map";
import { BMPDetailForm } from "./bmp-detail-form";

export default function BMPDetailPage() {
  return (
    <TwoColGrid>
      <HalfSpan>
        <Card sx={{ display: "flex", p: 3, height: "100%" }}>
          <Box sx={{ width: "100%" }}>
            <BMPDetailForm />
          </Box>
        </Card>
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
          <BMPDetailMap />
        </Card>
      </HalfSpan>
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
