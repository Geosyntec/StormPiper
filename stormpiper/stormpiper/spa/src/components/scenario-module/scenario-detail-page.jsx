import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import {
  Box,
  Card,
  Dialog,
  List,
  ListItem,
  Typography,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddIcon from "@mui/icons-material/Add";

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
import {
  dateFormatter,
  exportCSVFile,
  convertToCSV,
  transposeObject,
  sortResultsArray,
} from "../../utils/utils";
import { all_cols as volumeCols } from "../bmp-detail-page/bmp-results-volume";
import { all_cols as concCols } from "../bmp-detail-page/bmp-results-conc";
import { all_cols as loadCols } from "../bmp-detail-page/bmp-results-load";

async function getDataByID(id) {
  const response = await api_fetch(`/api/rest/scenario/${id}`);
  return response.json();
}

export default function ScenarioDetailPage({ setDrawerButtonList }) {
  const params = useParams();
  const [scenarioObject, setScenarioObject] = useState(null);
  const [submissionError, setSubmissionError] = useState(false);
  const [submissionErrorMsg, setSubmissionErrorMsg] = useState("error!");
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
  const [cachedScenario, setCachedScenario] = useState({});
  const infoRef = useRef(null);
  const delinRef = useRef(null);
  const facilityRef = useRef(null);
  const [facility, setFacility] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [delineation, setDelineation] = useState({
    type: "FeatureCollection",
    features: [],
  });

  const [resultsCalculatedAt, setResultsCalculatedAt] = useState(null);
  const [scenarioUpdatedAt, setScenarioUpdatedAt] = useState(null);
  const [viewState, setViewState] = useState(null);

  const buttonList = [
    {
      label: "View All Scenarios",
      icon: <ListAltIcon />,
      link: "/app/scenario",
    },
    {
      label: "Create New Scenario",
      icon: <AddIcon />,
      link: "/app/create-scenario",
    },
  ];

  useEffect(() => {
    setDrawerButtonList(buttonList);
  }, []);

  useEffect(() => {
    getDataByID(params.id).then((res) => {
      buildScenario(res);
      setCachedScenario(res);
      if (res.structural_tmnt_result || res.delin_load) {
        //only update our results calculated time when there are new results to report
        setResultsCalculatedAt(dateFormatter(res?.result_time_updated));
      }
      setScenarioUpdatedAt(dateFormatter(res?.input_time_updated));
    });
  }, [params.id, resultsSuccessDisplay]);

  function buildScenario(obj) {
    setScenarioObject(obj);
    if (obj?.input?.tmnt_facility_collection) {
      setFacility(obj.input.tmnt_facility_collection);
      setViewState(
        zoomToFeature({
          feature: obj.input.tmnt_facility_collection,
          transitionInterpolator: null,
          transitionDuration: 0,
        })
      );
    } else {
      setFacility({
        type: "FeatureCollection",
        features: [],
      });
    }
    if (obj?.input?.delineation_collection) {
      setDelineation(obj.input.delineation_collection);
      setViewState(
        zoomToFeature({
          feature: obj.input.delineation_collection,
          transitionInterpolator: null,
          transitionDuration: 0,
        })
      );
    } else {
      setDelineation({
        type: "FeatureCollection",
        features: [],
      });
    }
  }

  function resetScenario() {
    setFacility(null);
    setDelineation(null);
    buildScenario(cachedScenario);
    setMapMode("default");
    setScenarioEditMode(false);
  }

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

  function updateFacility(facility) {
    if (facility?.features[0] && delineation?.features[0]) {
      let delineationToUpdate = { ...delineation };
      delineation.features[0].properties["relid"] =
        facility.features[0].properties["node_id"];

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
      facility?.features?.length > 0
        ? await facilityRef.current?.triggerValidation(facility)
        : true;
    let delinFormValid =
      delineation?.features?.length > 0
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
    }
    setMapMode("default");
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
          setResultsPollInterval(null);
          setResultsSuccessDisplay({ status: true, msg: "Calculation Failed" });
          console.error("Scenario will not solve");
        }
        return res.task_id;
      });
    let intervalMilliseconds = 2500;
    let maxTimeSeconds = 60.0; // try for 1 min, these solves should be ~5-15 seconds
    let counterSeconds = 0.0;
    const resultsPoll = setInterval(async () => {
      counterSeconds += intervalMilliseconds / 1000;
      if (counterSeconds >= maxTimeSeconds) {
        clearInterval(resultsPoll);
        setResultsPollInterval(null);
        setResultsSuccessDisplay({
          status: true,
          msg: "Calculation refresh timed out. Try refreshing the page in a few minutes.",
        });

        return;
      }
      const taskResult = await api_fetch(`/api/rest/tasks/${taskID}`)
        .then((res) => res.json())
        .then((res) => {
          return res?.status || "";
        });
      if (taskResult == "" || taskResult.toLowerCase().includes("fail")) {
        clearInterval(resultsPoll);
        setResultsPollInterval(null);
        setResultsSuccessDisplay({ status: true, msg: "Calculation Failed" });
      } else if (taskResult === "SUCCESS") {
        setResultsSuccessDisplay({ status: true, msg: "Results Calculated" });
      }
    }, intervalMilliseconds);
    setResultsPollInterval(resultsPoll);
  }

  async function submitScenario() {
    const scenarioToSubmit = {
      name: scenarioObject.name,
      info: scenarioObject.info,
      input: scenarioObject.input,
    };
    const response = await api_fetch(`/api/rest/scenario/${params.id}`, {
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "Content-type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(scenarioToSubmit),
    })
      .then((resp) => {
        if (resp.status >= 400) {
          setSubmissionError(true);
        } else {
          setResultsSuccessDisplay({
            status: true,
            msg: "Scenario Updated Successfully",
          });
          setScenarioEditMode(false);
        }
        return resp.json();
      })
      .then((r) => {
        //assume that only error responses have a detail object
        if (r.detail) {
          setSubmissionErrorMsg(r.detail);
        }
      })
      .catch((err) => {
        setSubmissionError(true);
        setSubmissionErrorMsg(err.message);
        setScenarioEditMode(true);
        console.log(err);
      });
    return response;
  }

  function _renderErrorHeader(msg) {
    let beginningText = /[0-9]*\svalidation (error[s]*)/g;
    let header = msg.match(beginningText);
    if (header) {
      return header[0];
    } else {
      return msg;
    }
  }

  function _getErrorList(msg) {
    let errorList = [];

    //Find the number of errors so that we know
    let errorNum = 0;
    let nums = msg.match(/[0-9]*/g);
    if (nums) {
      errorNum = parseInt(nums[0]);
    }

    //Isolate just the list of errors
    let beginningText = /[0-9]*\svalidation (error[s]*\sfor\s\w*\s)/g;
    msg = msg.replaceAll(beginningText, "");

    let err = msg.match(/([\w\s.;=_]*)\([\w.=;\s]+\)/g);
    if (err) {
      err.map((e) => {
        errorList.push(e.replace(/\([\w.=;\s]+\)/g, "")); //remove the error type in parantheses
      });
    }
    return errorList;
  }

  function createBMPResultsCSV() {
    if (
      !scenarioObject?.structural_tmnt_result ||
      !scenarioObject?.input?.tmnt_facility_collection
    ) {
      return "Not Available\r\n";
    }
    let sortedFields = Array.from(
      new Set([...volumeCols, ...concCols, ...loadCols]).values()
    );
    const nodeID =
      scenarioObject.input.tmnt_facility_collection.features[0].properties
        .node_id;
    const allResults = scenarioObject.structural_tmnt_result || [];
    const bmpResults = allResults.filter((x) => x?.node_id === nodeID);

    const sortedResults = convertToCSV(
      sortResultsArray(
        bmpResults,
        new Set([...volumeCols, ...concCols, ...loadCols])
      ),
      sortedFields
    );

    return sortedResults;
  }

  function createDelinResultsCSV() {
    if (
      !scenarioObject?.delin_load ||
      !scenarioObject?.input?.delineation_collection
    ) {
      return "Not Available\r\n";
    }
    const delinID =
      scenarioObject.input.delineation_collection.features[0].properties.altid;

    const allResults = scenarioObject.delin_load || [];
    const delinResults = allResults.filter((x) => x?.altid === delinID);

    const sortedResults = convertToCSV(
      delinResults,
      Object.keys(delinResults[0])
    );

    return sortedResults;
  }

  function createTmntCSV() {
    if (!scenarioObject?.structural_tmnt?.[0]) {
      return "Not Available\r\n";
    }

    let tmntProperties = { ...scenarioObject.structural_tmnt[0] };
    delete tmntProperties["present_value_cost_table"]; //remove nested objects
    delete tmntProperties["present_value_chart_table"];

    const sortedTmntFields = Array.from(
      new Set(["node_id", "facility_type", ...Object.keys(tmntProperties)])
    );

    const sortedResults = convertToCSV(
      transposeObject(sortResultsArray(tmntProperties, sortedTmntFields)[0]),
      ["BMP Attribute", "Value"]
    );

    return sortedResults;
  }

  function createCostSummaryCSV() {
    if (!scenarioObject?.structural_tmnt?.[0]?.["present_value_cost_table"]) {
      return "Not Available\r\n";
    }

    const costTable =
      scenarioObject.structural_tmnt[0]["present_value_cost_table"];

    return convertToCSV(costTable, Object.keys(costTable[0]));
  }

  function exportScenarioDetails() {
    const date = new Date().toLocaleString("en-US", {
      dateStyle: "short",
    });
    const header = `Scenario Report for ${scenarioObject.name}\r\nExported ${date}\r\n`;
    const buffer = "////////////////////////////////////////\r\n";
    const finalCSV = [
      header,
      "BMP Attributes\r\n",
      createTmntCSV(),
      "BMP Present Value Cost Summary\r\n",
      createCostSummaryCSV(),
      "BMP WQ Results by Climate Epoch\r\n",
      createBMPResultsCSV(),
      "Delineation WQ Results by Climate Epoch\r\n",
      createDelinResultsCSV(),
    ].join(buffer);
    exportCSVFile(finalCSV, `${scenarioObject.name}_scenario_details_${date}`);
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "start",
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
                >
                  Edit
                </Button>
              </Box>
              <ScenarioInfoForm
                scenario={scenarioObject}
                scenarioSetter={updateScenario}
                ref={infoRef}
                formDisabled={
                  !scenarioEditMode ||
                  ["editFacility", "editDelineation"].includes(mapMode)
                }
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Facility Details</Typography>
                {scenarioEditMode && (
                  <Button
                    sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                    onClick={() => {
                      setShowDelinEditTabs(false);
                      setShowFacilityEditTabs(true);
                      if (facility?.features?.length > 0) {
                        setMapMode("editFacility");
                      } else {
                        setMapMode("drawFacility");
                      }
                    }}
                    disabled={[
                      "drawFacility",
                      "editFacility",
                      "editDelineation",
                      "drawDelineation",
                    ].includes(mapMode)}
                  >
                    {facility?.features?.length > 0 ? "Edit" : "Add"} Facility
                    Location
                  </Button>
                )}
              </Box>
              {facility?.features?.length > 0 ? (
                <Box>
                  <ScenarioBMPForm
                    facility={facility?.features?.length > 0 && facility}
                    facilitySetter={updateFacility}
                    ref={facilityRef}
                    formDisabled={!scenarioEditMode || mapMode != "default"}
                    showHelperText={false}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1">No Facility</Typography>
                </Box>
              )}

              <br></br>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pb: 1,
                }}
              >
                <Typography variant="h6">Delineation Details</Typography>
                {scenarioEditMode && (
                  <Button
                    sx={{ alignSelf: "flex-start", paddingLeft: 0 }}
                    onClick={() => {
                      setShowFacilityEditTabs(false);
                      setShowDelinEditTabs(true);
                      if (delineation?.features?.length > 0) {
                        setMapMode("editDelineation");
                      } else {
                        setMapMode("drawDelineation");
                      }
                    }}
                    disabled={[
                      "editFacility",
                      "drawFacility",
                      "editDelineation",
                      "drawDelineation",
                    ].includes(mapMode)}
                  >
                    {delineation?.features?.length > 0 ? "Edit" : "Add"}{" "}
                    Delineation Location
                  </Button>
                )}
              </Box>
              {delineation?.features?.length > 0 ? (
                <Box sx={{ width: { md: "50%" }, pr: { md: 2 } }}>
                  <ScenarioDelineationForm
                    delineationSetter={updateDelineation}
                    delineation={delineation}
                    ref={delinRef}
                    formDisabled={!scenarioEditMode || mapMode != "default"}
                    showHelperText={false}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1">No Delineation</Typography>
                </Box>
              )}

              <br></br>
              {scenarioEditMode && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      saveScenario();
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      resetScenario();
                      setShowFacilityEditTabs(false);
                      setShowDelinEditTabs(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
          <Dialog
            open={submissionError}
            onClose={() => setSubmissionError(false)}
          >
            <Box sx={{ p: 2 }}>
              <Typography>
                <strong>Error Saving BMP</strong>
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ py: 0, px: 2 }}>
              {submissionErrorMsg && _renderErrorHeader(submissionErrorMsg)}
            </Typography>
            <List sx={{ mt: 0, pr: 1 }}>
              {_getErrorList(submissionErrorMsg).map((msg, i) => {
                return (
                  <ListItem key={i}>
                    <Typography variant="caption">{msg}</Typography>
                  </ListItem>
                );
              })}
            </List>
          </Dialog>
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
              editorMode={true}
              viewState={viewState}
            />
          </Card>
          <Card sx={{ display: "flex", flexDirection: "column", my: 2, p: 3 }}>
            <Typography>
              Scenario Details Last Updated At: <em>{scenarioUpdatedAt}</em>
            </Typography>
            <Typography>
              Results Last Updated At: <em>{resultsCalculatedAt || "--"}</em>
            </Typography>
            <Button
              onClick={initiateScenarioSolve}
              variant="contained"
              sx={{ paddingLeft: 0, my: 1 }}
              disabled={
                resultsPollInterval != null ||
                scenarioEditMode ||
                ["editFacility", "editDelineation"].includes(mapMode)
              }
            >
              Calculate Scenario WQ Results
              {resultsPollInterval && (
                <CircularProgress
                  style={{ margin: "0.1em", alignSelf: "center" }}
                  size="1em"
                />
              )}
            </Button>
            <Button variant="contained" onClick={exportScenarioDetails}>
              Export Scenario Details
            </Button>
          </Card>
        </HalfSpan>
        <FullSpan>
          <Box>
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
