import { Box, Button, Card, Typography } from "@mui/material";

import { ScenarioInfoTable } from "./scenario-info-table";
import { TwoColGrid, FullSpan } from "../base/two-col-grid";
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
        <FullSpan>
          <Card
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "space-between",
              p: 2,
            }}
          >
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/app/create-scenario")}
            >
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: { xs: 0, sm: "100%" },
                }}
              >
                Create New Scenario
              </Box>
            </Button>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30ch",
              }}
            >
              <Typography variant="h6">View All Scenarios</Typography>
            </Box>

            <Box sx={{ width: { sm: "0px", md: "30ch" } }}> </Box>
          </Card>
        </FullSpan>
        <FullSpan>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AllScenariosMap
              scenarios={allScenarios}
              focusScenario={focusScenario}
            />
          </Card>
        </FullSpan>
        <FullSpan>
          <Card sx={{ height: 800, p: 2 }}>
            <Box sx={{ alignItems: "center" }}>
              <Typography variant="body1">
                Use the table below to find an existing scenario or to create a
                new one.
              </Typography>
              <Button
                color="primary"
                startIcon={<AddIcon />}
                sx={{ alignSelf: "flex-start", px: 0 }}
                onClick={() => navigate("/app/create-scenario")}
              >
                Create New Scenario
              </Button>
            </Box>
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
