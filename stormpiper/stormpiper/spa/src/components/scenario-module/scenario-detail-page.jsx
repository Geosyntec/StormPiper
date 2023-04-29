import {
  Box,
  Card,
  Typography,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, Fragment, useRef } from "react";
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
import { zoomToFeature } from "../../utils/map_utils";

async function getDataByID(id) {
  const response = await api_fetch(`/api/rest/scenario/${id}`);
  return response.json();
}

export default function ScenarioDetailPage() {
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
  const infoRef = useRef(null);
  const delinRef = useRef(null);
  const facilityRef = useRef(null);

  useEffect(() => {
    getDataByID(params.id).then((res) => {
      // setScenarioObject({
      //   name: res.name,
      //   input: res.input,
      //   info: res.info,
      // });
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
    if (
      (await infoRef.current?.triggerValidation()) === false ||
      (await facilityRef.current?.triggerValidation(facility)) === false ||
      (await delinRef.current?.triggerValidation(delineation)) === false
    ) {
      errMsg = "Errors Present in Scenario Details";
    }
    if (errMsg) {
      setResultsLoadingDisplay({
        status: true,
        msg: errMsg,
      });
    } else {
      submitScenario();
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

  async function saveScenario() {
    let errMsg = null;
    if (
      (await infoRef.current?.triggerValidation()) === false ||
      (await facilityRef.current?.triggerValidation(facility)) === false ||
      (await delinRef.current?.triggerValidation(delineation)) === false
    ) {
      errMsg = "Errors Present in Scenario Details";
    }
    if (errMsg) {
      setResultsLoadingDisplay({
        status: true,
        msg: errMsg,
      });
    } else {
      submitScenario();
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
              <Typography align="left" variant="h6">
                Scenario Review
              </Typography>
              <ScenarioInfoForm
                scenario={scenarioObject}
                scenarioSetter={updateScenario}
                ref={infoRef}
              />
              {facility?.features?.length > 0 && (
                <Box>
                  <ScenarioBMPForm
                    facility={facility.features.length > 0 && facility}
                    facilitySetter={updateFacility}
                    ref={facilityRef}
                  />
                </Box>
              )}
              <Button
                sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                onClick={() => {
                  setShowDelinEditTabs(false);
                  setShowFacilityEditTabs(true);
                  setMapMode("default");
                }}
              >
                Add/Edit Facility
              </Button>
              <br></br>
              {delineation?.features?.length > 0 && (
                <Box>
                  <ScenarioDelineationForm
                    delineationSetter={updateDelineation}
                    delineation={delineation}
                    ref={delinRef}
                  />
                </Box>
              )}
              <Button
                sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                onClick={() => {
                  setShowFacilityEditTabs(false);
                  setShowDelinEditTabs(true);
                  setMapMode("default");
                }}
              >
                Add/Edit Delineation
              </Button>
              <br></br>
              <Button
                onClick={initiateScenarioSolve}
                sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                disabled={resultsPollInterval}
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
              <Button variant="contained" onClick={() => saveScenario()}>
                Save
              </Button>
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
          <ScenarioBMPDetailResults data={scenarioObject} />
        </FullSpan>
        <FullSpan>
          <ScenarioDelineationDetailResults data={scenarioObject} />
        </FullSpan>
      </TwoColGrid>
    </Box>
  );
}
