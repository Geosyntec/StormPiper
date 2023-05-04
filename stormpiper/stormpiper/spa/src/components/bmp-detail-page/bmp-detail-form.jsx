import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Dialog, DialogActions, Typography, Button } from "@mui/material";

import { api_fetch } from "../../utils/utils";
import { BMPForm } from "../bmpForm";

export function BMPDetailForm() {
  const params = useParams();
  const [specs, setSpecs] = useState({
    context: {},
    facilitySpec: {},
  });
  const [facilityType, setFacilityType] = useState("");
  const [loadingState, setLoadingState] = useState(true);
  const [TMNTAttrs, setTMNTAttrs] = useState({});
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultError, setResultError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("error!");

  useEffect(() => {
    if (!params.id) return;

    // OpenAPI spec holds the base facility types used by nereid
    // Context endpoint holds mapping between project-specific names and base types
    let resources = [
      "/openapi.json",
      "/api/rest/reference/context",
      "/api/rest/tmnt_facility/" + params.id,
    ];

    setLoadingState(true);

    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        setSpecs({
          facilitySpec: resArray[0].components.schemas,
          context: resArray[1].api_recognize.treatment_facility.facility_type,
        });
        setFacilityType(resArray[2].facility_type);
        setTMNTAttrs(resArray[2]);
      })
      .then(() => {
        console.log("tmnt: ", TMNTAttrs);
        setLoadingState(false);
      });
  }, []);

  function removeEdits() {
    let resources = ["/api/rest/tmnt_facility/" + params.id];

    setLoadingState(true);

    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        setTMNTAttrs(resArray[0]);
        setFacilityType(resArray[0].facility_type);
      })
      .then(() => {
        console.log("tmnt: ", TMNTAttrs);
        setLoadingState(false);
      });
  }

  async function _handleSubmit(data, isSimple) {
    if (isSimple && !data["facility_type"].match("_simple")) {
      console.log("Appending simple");
      data["facility_type"] = data["facility_type"] + "_simple";
    }

    console.log("Submitting Patch Request: ", data);
    const response = await api_fetch("/api/rest/tmnt_attr/" + params.id, {
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "Content-type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(data),
    })
      .then((resp) => {
        if (resp.status === 200) {
          setResultSuccess(true);
        } else if (resp.status === 422) {
          setResultError(true);
        }
        return resp.json();
      })
      .then((r) => {
        //assume that only error responses have a detail object
        if (r.detail) {
          setErrorMsg(r.detail);
        }
      })
      .catch((err) => {
        console.log("Error patching tmnt:");
        setResultError(true);
        console.log(err);
      });
    return response;
  }
  function _handleRecalculate() {
    api_fetch("/api/rpc/solve_watershed")
      .then((resp) => {
        setResultSuccess(false);
        console.log("Recalculation started: ", resp);
      })
      .catch((err) => {
        console.log("Recalculate Failed: ", err);
      });
  }

  function _renderErrorHeader(msg) {
    let beginningText = /[0-9]*\svalidation (error[s]*)/g;
    let header = msg.match(beginningText);
    if (header) {
      return header[0];
    } else {
      return header;
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
    console.log("Found errors:", err);
    if (err) {
      err.map((e) => {
        errorList.push(e.replace(/\([\w.=;\s]+\)/g, "")); //remove the error type in parantheses
      });
    }
    return errorList;
  }

  function renderForm() {
    if (loadingState) {
      return <p>loading...</p>;
    } else {
      let fType = facilityType;
      let fTypeRoot = fType.replace("_simple", "");

      let simpleBaseType;
      if (fType === "no_treatment") {
        simpleBaseType = specs.context[fTypeRoot].validator; //no_treatment has no simple equivalent
      } else {
        simpleBaseType = specs.context[fTypeRoot + "_simple"].validator;
      }
      let baseType = specs.context[fTypeRoot].validator;

      let facilityFields = specs.facilitySpec[baseType];
      let simpleFacilityFields = specs.facilitySpec[simpleBaseType];
      return (
        <>
          <BMPForm
            facilitySpec={specs.facilitySpec}
            allFields={facilityFields}
            simpleFields={simpleFacilityFields}
            values={TMNTAttrs}
            allFacilities={specs.context}
            currentFacility={facilityType}
            facilityChangeHandler={setFacilityType}
            handleFormSubmit={_handleSubmit}
            handleEditReset={removeEdits}
          ></BMPForm>
          <Dialog open={resultSuccess} onClose={() => setResultSuccess(false)}>
            <Box sx={{ padding: "15px" }}>
              <Typography>
                <strong>Facility Details Submitted</strong>
              </Typography>
            </Box>
            <DialogActions>
              <Button onClick={_handleRecalculate}>
                Recalculate WQ Results
              </Button>
              <Button onClick={() => setResultSuccess(false)}>Continue</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={resultError} onClose={() => setResultError(false)}>
            <Box sx={{ padding: "15px" }}>
              <Typography>
                <strong>Submission Error</strong>
              </Typography>
              <Typography variant="caption">Please try again</Typography>
            </Box>
            <Typography variant="caption" sx={{ padding: "0em 1em" }}>
              {_renderErrorHeader(errorMsg)}
            </Typography>
            <ul style={{ "margin-top": "none", "padding-right": "1em" }}>
              {_getErrorList(errorMsg).map((msg) => {
                return <li>{msg}</li>;
              })}
            </ul>
          </Dialog>
        </>
      );
    }
  }

  return (
    <Box>
      {/* {_renderUpdateBox()} */}
      {!loadingState && renderForm()}
      {/* <Button onClick={removeEdits}>Reset</Button> */}
    </Box>
  );
}
