import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  Snackbar,
} from "@mui/material";

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
  const [resultError, setResultError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("error!");
  const [snackbarContents, setSnackbarContents] = useState({
    status: false,
    msg: "",
    closeHandler: () => {},
  });

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

    if (!isSimple) {
      data["facility_type"] = data["facility_type"].replaceAll("_simple", "");
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
        if (resp.status >= 400) {
          setResultError(true);
        } else {
          setSnackbarContents({
            status: true,
            msg: "BMP Updated",
            closeHandler: () => {
              setSnackbarContents({
                status: false,
                msg: "",
                closeHandler: () => {},
              });
            },
          });
        }
        return resp.json();
      })
      .then((r) => {
        //assume that only error responses have a detail object
        if (r.detail) {
          console.log("setting err msg: ", r.detail);
          setErrorMsg(r.detail);
        }
      })
      .catch((err) => {
        console.log("Error patching tmnt:");
        setResultError(true);
        setErrorMsg(err.message);
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
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={snackbarContents.status}
            autoHideDuration={3000}
            onClose={snackbarContents.closeHandler}
            message={snackbarContents.msg}
          />
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
          <Dialog open={resultError} onClose={() => setResultError(false)}>
            <Box sx={{ p: 2 }}>
              <Typography>
                <strong>Error Saving BMP</strong>
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ py: 0, px: 2 }}>
              {errorMsg && _renderErrorHeader(errorMsg)}
            </Typography>
            <List sx={{ mt: 0, pr: 1 }}>
              {_getErrorList(errorMsg).map((msg) => {
                return (
                  <ListItem>
                    <Typography variant="caption">{msg}</Typography>
                  </ListItem>
                );
              })}
            </List>
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
