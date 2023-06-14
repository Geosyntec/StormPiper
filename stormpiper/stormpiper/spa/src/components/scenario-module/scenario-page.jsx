import { Box, Button, Card, Typography } from "@mui/material";

import { ScenarioInfoTable } from "./scenario-info-table";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import AllScenariosMap from "./scenario-all-map";
import { api_fetch } from "../../utils/utils";
import { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

export default function ScenarioReviewPage() {
  async function getAllScenarios() {
    const response = await api_fetch(`/api/rest/scenario`);
    const data = await response.json();

    data.forEach((x) => {
      x.info &&
        Object.keys(x.info).map((attr) => {
          x[`info-${attr}`] = x.info[attr];
        });
    });
    console.log(data);
    setAllScenarios(data);
  }
  const navigate = useNavigate();
  const [allScenarios, setAllScenarios] = useState([]);
  const [focusScenario, setfocusScenario] = useState(null);

  useEffect(() => {
    getAllScenarios();
  }, []);
  return (
    <Box display="flex" justifyContent="center">
      <TwoColGrid>
        <HalfSpan md={4} sx={{ position: "sticky", top: 0, zIndex: 1 }}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "300px",
              height: "100%",
              alignContent: "flex-start",
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
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ alignSelf: "flex-start", my: 2 }}
              onClick={() => navigate("/app/create-scenario")}
            >
              Create New Scenario
            </Button>
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
