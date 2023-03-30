import { Card } from "@mui/material";

import { ScenarioInfoTable } from "./scenario-info-table";
import { TwoColGrid, FullSpan } from "../base/two-col-grid";

export default function ScenarioReviewPage() {
  return (
    <TwoColGrid>
      <FullSpan>
        <Card
          sx={{
            textAlign: "center",
            padding: 20,
          }}
        >
          scenario map placeholder
        </Card>
      </FullSpan>
      <FullSpan>
        <ScenarioInfoTable />
      </FullSpan>
    </TwoColGrid>
  );
}
