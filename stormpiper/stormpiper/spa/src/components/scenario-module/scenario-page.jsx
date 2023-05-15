import { Box, Card, Typography } from "@mui/material";

import { ScenarioInfoTable } from "./scenario-info-table";
import { TwoColGrid, FullSpan } from "../base/two-col-grid";
import AllScenariosMap from "./scenario-all-map";
import { api_fetch } from "../../utils/utils";
import { useState, useEffect } from "react";

export default function ScenarioReviewPage() {
  async function getAllScenarios() {
    const response = await api_fetch(`/api/rest/scenario`);
    const data = await response.json();
    setAllScenarios(data);
  }

  const [allScenarios, setAllScenarios] = useState([]);

  useEffect(() => {
    getAllScenarios();
  }, []);
  return (
    <Box py={3} display="flex" justifyContent="center">
      <TwoColGrid>
        <FullSpan
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5">View All Scenarios</Typography>
        </FullSpan>
        <FullSpan>
          <Card
            sx={{
              display: "flex",
              minHeight: 400,
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AllScenariosMap scenarios={allScenarios} />
          </Card>
        </FullSpan>
        <FullSpan>
          <Card sx={{ p: 2 }}>
            <ScenarioInfoTable
              data={allScenarios}
              dataRefresher={getAllScenarios}
            />
          </Card>
        </FullSpan>
      </TwoColGrid>
    </Box>
  );
}
