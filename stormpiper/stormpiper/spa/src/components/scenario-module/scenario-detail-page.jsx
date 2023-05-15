import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  Typography,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { ScenarioBMPDetailResults } from "./scenario-bmp-results";
import { ScenarioDelineationDetailResults } from "./scenario-delin-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import ScenarioCreateMap from "./scenario-create-map";
import { ScenarioDelineationForm } from "./scenario-create-delineation-form";
import { ScenarioBMPForm } from "./scenario-bmp-detail-form";
import { api_fetch } from "../../utils/utils";
import { ScenarioInfoForm } from "./scenario-create-info-form";
import CostSummary from "../cost-analysis/cost-summary";
import { zoomToFeature } from "../../utils/map_utils";

async function getDataByID(id) {
  const response = await api_fetch(`/api/rest/scenario/${id}`);
  return response.json();
}

export default function ScenarioDetailPage({ setDrawerButtonList }) {
  const params = useParams();
  const [scenarioObject, setScenarioObject] = useState(null);
  const [resultsPollInterval, setResultsPollInterval] = useState(null);
  const [resultsSuccessDisplay, setResultsSuccessDisplay] = useState({
    status: false,
    msg: "",
  });
  const [resultsLoadingDisplay, setResultsLoadingDisplay] = useState({
    status: false,
    msg: "",
  });
  const [showDelinEditTabs, setShowDelinEditTabs] = useState(false);
  const [showFacilityEditTabs, setShowFacilityEditTabs] = useState(false);
  const [mapMode, setMapMode] = useState("default");
  const [scenarioEditMode, setScenarioEditMode] = useState(false);
  const infoRef = useRef(null);
  const delinRef = useRef(null);
  const facilityRef = useRef(null);

  const navigate = useNavigate();
  const buttonList = [
    {
      label: "View All Scenarios",
      icon: <ListAltIcon />,
      clickHandler: () => navigate("/app/scenario"),
    },
  ];

  useEffect(() => {
    setDrawerButtonList(buttonList);
  }, []);

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
  }, [params.id, resultsSuccessDisplay]);

  function updateScenario(field, value) {
    let scenarioToUpdate = { ...scenarioObject };
    if (!scenarioToUpdate.info) {
      scenarioToUpdate["info"] = {};
    }
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

  function updateFacility(facility) {
    if (facility.features[0] && delineation.features[0]) {
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
    } else {
      setFacility(facility);
      setScenarioObject({
        ...scenarioObject,
        input: {
          delineation_collection: null,
          tmnt_facility_collection: facility,
        },
      });
    }
  }
  function updateDelineation(delineation) {
    console.log("updating delin: ", delineation);
    setDelineation(delineation);
    setScenarioObject({
      ...scenarioObject,
      input: {
        ...scenarioObject.input,
        delineation_collection: delineation,
      },
    });
  }

  async function saveScenario() {
    let errMsg = null;
    let infoFormValid = await infoRef.current?.triggerValidation();
    let facilityFormValid =
      facility.features.length > 0
        ? await facilityRef.current?.triggerValidation(facility)
        : true;
    let delinFormValid =
      delineation.features.length > 0
        ? await delinRef.current?.triggerValidation(delineation)
        : true;
    if (!infoFormValid || !facilityFormValid || !delinFormValid) {
      errMsg = "Errors Present in Scenario Details";
    }
    if (errMsg) {
      setResultsLoadingDisplay({
        status: true,
        msg: errMsg,
      });
    } else {
      submitScenario();
      setScenarioEditMode(false);
    }
  }

  function submitScenario() {
    const scenarioToSubmit = {
      name: scenarioObject.name,
      info: scenarioObject.info,
      input: scenarioObject.input,
    };
    console.log("Submitting scenario: ", scenarioToSubmit);
    api_fetch(`/api/rest/scenario/${params.id}`, {
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "Content-type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(scenarioToSubmit),
    }).then((res) => {
      if (res.status === 200) {
        setResultsSuccessDisplay({
          status: true,
          msg: "Scenario Updated Successfully",
        });
      }
    });
  }

  async function initiateScenarioSolve() {
    setResultsLoadingDisplay({
      status: true,
      msg: "Scenario Solve Started",
    });
    const taskID = await api_fetch(`/api/rpc/solve_scenario/${params.id}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (!["STARTED", "SUCCESS"].includes(res.status)) {
          throw new Error("Scenario will not solve");
        }
        return res.task_id;
      });
    const resultsPoll = setInterval(async () => {
      const taskResult = await api_fetch(`/api/rest/tasks/${taskID}`)
        .then((res) => res.json())
        .then((res) => {
          return res.status;
        });
      if (taskResult === "SUCCESS") {
        setResultsSuccessDisplay({ status: true, msg: "Results Calculated" });
      }
    }, 5000);
    setResultsPollInterval(resultsPoll);
  }

  function submitScenario() {
    const scenarioToSubmit = {
      name: scenarioObject.name,
      info: scenarioObject.info,
      input: scenarioObject.input,
    };
    console.log("Submitting scenario: ", scenarioToSubmit);
    api_fetch(`/api/rest/scenario/${params.id}`, {
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "Content-type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(scenarioToSubmit),
    }).then((res) => {
      if (res.status === 200) {
        setResultsSuccessDisplay({
          status: true,
          msg: "Scenario Updated Successfully",
        });
      }
    });
  }

  async function initiateScenarioSolve() {
    setResultsLoadingDisplay({
      status: true,
      msg: "Scenario Solve Started",
    });
    const taskID = await api_fetch(`/api/rpc/solve_scenario/${params.id}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (!["STARTED", "SUCCESS"].includes(res.status)) {
          throw new Error("Scenario will not solve");
        }
        return res.task_id;
      });
    const resultsPoll = setInterval(async () => {
      const taskResult = await api_fetch(`/api/rest/tasks/${taskID}`)
        .then((res) => res.json())
        .then((res) => {
          return res.status;
        });
      if (taskResult === "SUCCESS") {
        setResultsSuccessDisplay({ status: true, msg: "Results Calculated" });
      }
    }, 5000);
    setResultsPollInterval(resultsPoll);
  }

  let zoomFeature = null;
  let viewState = null;

  if (delineation?.features?.length > 0) {
    zoomFeature = delineation;
  } else if (facility?.features?.length > 0) {
    zoomFeature = facility;
  }

  viewState =
    zoomFeature &&
    zoomToFeature({
      feature: zoomFeature,
      transitionInterpolator: null,
      transitionDuration: 0,
    });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={resultsSuccessDisplay.status}
        autoHideDuration={3000}
        onClose={() => {
          setResultsSuccessDisplay({ status: false, msg: "" });
          clearInterval(resultsPollInterval);
          setResultsPollInterval(null);
        }}
        message={resultsSuccessDisplay.msg}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={resultsLoadingDisplay.status}
        autoHideDuration={1000}
        onClose={() => setResultsLoadingDisplay({ status: false, msg: "" })}
        message={resultsLoadingDisplay.msg}
      />
      <TwoColGrid>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
            }}
          >
            <Box sx={{ width: "100%", height: "100%", p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography align="left" variant="h6">
                  Scenario Review
                </Typography>
                <Button
                  onClick={() => setScenarioEditMode(true)}
                  disabled={scenarioEditMode}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      color: "red",
                    },
                  }}
                >
                  Edit
                </Button>
              </Box>
              <ScenarioInfoForm
                scenario={scenarioObject}
                scenarioSetter={updateScenario}
                ref={infoRef}
                formDisabled={!scenarioEditMode}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Facility Details</Typography>
                {scenarioEditMode && (
                  <Button
                    sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                    onClick={() => {
                      setShowDelinEditTabs(false);
                      setShowFacilityEditTabs(true);
                      setMapMode("default");
                    }}
                    disabled={showFacilityEditTabs}
                  >
                    {facility.features.length > 0 ? "Edit" : "Add"} Facility
                  </Button>
                )}
              </Box>
              {facility?.features?.length > 0 ? (
                <Box>
                  <ScenarioBMPForm
                    facility={facility.features.length > 0 && facility}
                    facilitySetter={updateFacility}
                    ref={facilityRef}
                    formDisabled={!scenarioEditMode}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1">No Facility</Typography>
                </Box>
              )}

              <br></br>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Delineation Details</Typography>
                {scenarioEditMode && (
                  <Button
                    sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                    onClick={() => {
                      setShowFacilityEditTabs(false);
                      setShowDelinEditTabs(true);
                      setMapMode("default");
                    }}
                  >
                    {facility.features.length > 0 ? "Edit" : "Add"} Delineation
                  </Button>
                )}
              </Box>
              {delineation?.features?.length > 0 ? (
                <Box sx={{ width: { md: "50%" }, pr: { md: 2 } }}>
                  <ScenarioDelineationForm
                    delineationSetter={updateDelineation}
                    delineation={delineation}
                    ref={delinRef}
                    formDisabled={!scenarioEditMode}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1">No Delineation</Typography>
                </Box>
              )}

              <br></br>
              <Button
                onClick={initiateScenarioSolve}
                sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                disabled={resultsPollInterval || scenarioEditMode}
              >
                Calculate Scenario WQ Results
                {resultsPollInterval && (
                  <CircularProgress
                    style={{ margin: "0.1em", alignSelf: "center" }}
                    size="1em"
                  />
                )}
              </Button>
              <br></br>
              {scenarioEditMode && (
                <Button
                  variant="contained"
                  onClick={() => {
                    saveScenario();
                  }}
                >
                  Save
                </Button>
              )}
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
              mapMode={mapMode}
              setMapMode={setMapMode}
              facility={facility}
              facilitySetter={updateFacility}
              delineation={delineation}
              delineationSetter={updateDelineation}
              showDelinEditTabs={showDelinEditTabs}
              showFacilityEditTabs={showFacilityEditTabs}
              viewState={viewState}
            />
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
