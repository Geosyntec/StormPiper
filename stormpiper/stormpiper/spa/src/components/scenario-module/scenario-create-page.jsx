import { Card } from "@mui/material";

import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";

export default function ScenarioCreatePage() {
  return (
    <TwoColGrid>
      <FullSpan>
        <Card
          sx={{
            textAlign: "center",
            padding: 30,
          }}
        >
          scenario map placeholder for drawing delineations and placing BMPs
        </Card>
      </FullSpan>
      <HalfSpan>
        <Card
          sx={{
            textAlign: "center",
            padding: 20,
          }}
        >
          scenario BMP Attr editor
        </Card>
      </HalfSpan>
      <HalfSpan>
        <Card
          sx={{
            textAlign: "center",
            padding: 20,
          }}
        >
          scenario Delineation attr editor
        </Card>
      </HalfSpan>
    </TwoColGrid>
  );
}
