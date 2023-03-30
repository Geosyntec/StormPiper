import { Card, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { EditScenarioBasics } from "./edit-scenario-info";
import { ScenarioBMPDetailResults } from "./scenario-bmp-results";
import { ScenarioDelineationDetailResults } from "./scenario-delin-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";

import { api_fetch } from "../../utils/utils";

async function getDataByID(id) {
  const response = await api_fetch(`/api/rest/scenario/${id}`);
  return response.json();
}

export default function ScenarioDetailPage(props) {
  const params = useParams();
  const [scenarioData, setScenarioData] = useState(null);

  useEffect(() => {
    getDataByID(params.id).then((res) => {
      setScenarioData(res);
    });
  }, [params.id]);

  if (!scenarioData) {
    return (
      <TwoColGrid>
        <FullSpan>
          <Card padding={20}>"loading..."</Card>
        </FullSpan>
      </TwoColGrid>
    );
  }

  return (
    <TwoColGrid>
      <FullSpan>
        <Typography align="center" variant="h4">
          Scenario Review
        </Typography>
      </FullSpan>
      <HalfSpan>
        <EditScenarioBasics data={scenarioData} />
      </HalfSpan>
      <HalfSpan>
        <Card
          sx={{
            display: "flex",
            height: 500,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          map placeholder
        </Card>
      </HalfSpan>
      <FullSpan>
        <ScenarioBMPDetailResults data={scenarioData} />
      </FullSpan>
      <FullSpan>
        <ScenarioDelineationDetailResults data={scenarioData} />
      </FullSpan>
    </TwoColGrid>
  );
}
