import { Box, Card, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { EditScenarioBasics } from "./edit-scenario-info";
import { ScenarioBMPDetailResults } from "./scenario-bmp-results";
import { ScenarioDelineationDetailResults } from "./scenario-delin-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import { DrawPolygonMode, DrawPointMode, ViewMode } from "nebula.gl";
import ScenarioCreateMap from "./scenario-create-map";
import { ScenarioDelineationForm } from "./scenario-create-delineation-form";
import { ScenarioBMPForm } from "./scenario-bmp-detail-form";

import { api_fetch } from "../../utils/utils";
import { ScenarioInfoForm } from "./scenario-create-info-form";
import CostSummary from "../cost-analysis/cost-summary";

async function getDataByID(id) {
  const response = await api_fetch(`/api/rest/scenario/${id}`);
  return response.json();
}

export default function ScenarioDetailPage() {
  const params = useParams();
  const [scenarioObject, setScenarioObject] = useState(null);

  useEffect(() => {
    getDataByID(params.id).then((res) => {
      setScenarioObject(res);
      if (res.input.delineation_collection) {
        console.log("Found delineation");
        setDelineation(res.input.delineation_collection);
      }
      if (res.input.tmnt_facility_collection) {
        console.log("Found facility: ", res.input.tmnt_facility_collection);
        setFacility(res.input.tmnt_facility_collection);
      }
    });
  }, [params.id]);

  const [facilityEditMode, setFacilityEditMode] = useState(() => ViewMode);
  const [delineationEditMode, setDelineationEditMode] = useState(
    () => ViewMode
  );

  function updateScenario(field, value) {
    let scenarioToUpdate = { ...scenarioObject };
    switch (field) {
      case "purpose":
      case "description":
        scenarioToUpdate.info[field] = value;
        break;
      default:
        scenarioToUpdate[field] = value;
        break;
    }
    setScenarioObject(scenarioToUpdate);
  }

  const [facility, setFacility] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [delineation, setDelineation] = useState({
    type: "FeatureCollection",
    features: [],
  });
  // const [scenarioObject, setscenarioData] = useState({
  //   name: "",
  //   input: {
  //     delineation_collection: null,
  //     tmnt_facility_collection: null,
  //   },
  // });

  function toggleFacilityEditMode() {
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationEditMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }

  function updateFacility(facility) {
    if (facility.features[0]) {
      let delineationToUpdate = { ...delineation };
      delineation.features[0].properties["relid"] =
        facility.features[0].properties["node_id"];
      console.log("facility updated: ", facility);
      setFacility(facility);
      setScenarioObject({
        ...scenarioObject,
        input: {
          delineation_collection: delineationToUpdate,
          tmnt_facility_collection: facility,
        },
      });
    }
  }
  function updateDelineation(delineation) {
    setDelineation(delineation);
    setScenarioObject({
      ...scenarioObject,
      input: {
        ...scenarioObject.input,
        delineation_collection: delineation,
      },
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <TwoColGrid>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              height: "100%",
            }}
          >
            <Box sx={{ width: "100%", p: 3 }}>
              <Typography align="left" variant="h6">
                Scenario Review
              </Typography>
              <ScenarioInfoForm
                scenario={scenarioObject}
                scenarioSetter={updateScenario}
              />
              {/* <EditScenarioBasics data={scenarioObject} /> */}
            </Box>
          </Card>
        </HalfSpan>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              height: "500px",
            }}
          >
            <ScenarioCreateMap
              facilityEditMode={facilityEditMode}
              delineationEditMode={delineationEditMode}
              facility={facility}
              facilitySetter={updateFacility}
              delineation={delineation}
              delineationSetter={updateDelineation}
            />
          </Card>
        </HalfSpan>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              p: 3,
            }}
          >
            {facility?.features?.length > 0 ? (
              <ScenarioBMPForm
                facility={facility.features.length > 0 && facility}
                facilitySetter={updateFacility}
              />
            ) : (
              <Typography variant="body1">No Facility to Update</Typography>
            )}
          </Card>
        </HalfSpan>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              height: "100%",
              minHeight: "200px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {delineation?.features?.length > 0 ? (
              <ScenarioDelineationForm
                delineationPropSetter={updateDelineation}
                delineation={delineation}
              />
            ) : (
              <Typography variant="body1">No Delineation to Update</Typography>
            )}
          </Card>
        </HalfSpan>
        <FullSpan>
          <Box pb={3}>
            <Card sx={{ p: 2 }}>
              <CostSummary
                tmntDetails={scenarioObject?.structural_tmnt?.[0]}
                updateFacilityData={() => {
                  console.log("attempted cost refresh. no op.");
                }}
              />
            </Card>
          </Box>
        </FullSpan>
        <FullSpan>
          <ScenarioBMPDetailResults data={scenarioObject} />
        </FullSpan>
        <FullSpan>
          <ScenarioDelineationDetailResults data={scenarioObject} />
        </FullSpan>
      </TwoColGrid>
    </Box>
  );
}
