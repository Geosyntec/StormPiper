import { Box, Card, Typography } from "@mui/material";

import { ScenarioInfoTable } from "./scenario-info-table";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
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
  const [focusScenario, setfocusScenario] = useState(null);

  useEffect(() => {
    getAllScenarios();
  }, []);
  return (
    <Box py={3} display="flex" justifyContent="start">
      <TwoColGrid>
        <HalfSpan md={4} sx={{ position: "sticky", top: 0, zIndex: 1 }}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "300px",
              height: "100%",
              alignContent: "center",
              justifyContent: "start",
              padding: 2,
            }}
          >
            <Typography sx={{ my: 2 }} variant="h4">
              View All Scenarios
            </Typography>
            <Typography variant="body1">
              Use the table below to find an existing scenario or to create a
              new one.
            </Typography>
          </Card>
        </HalfSpan>
        <HalfSpan md={8} sx={{ position: "sticky", top: 0, zIndex: 1 }}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
            }}
          >
            <AllScenariosMap
              scenarios={allScenarios}
              focusScenario={focusScenario}
            />
          </Card>
        </HalfSpan>
        <FullSpan>
          <Card sx={{ height: 500, p: 2 }}>
            <ScenarioInfoTable
              data={allScenarios}
              dataRefresher={getAllScenarios}
              focusScenario={focusScenario}
              focusScenarioSetter={setfocusScenario}
            />
          </Card>
        </FullSpan>
      </TwoColGrid>
    </Box>
  );
}
