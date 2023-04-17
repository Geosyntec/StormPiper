import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { api_fetch } from "../../utils/utils";
import { BMPForm } from "../bmpForm";
import { Box, Dialog, DialogActions, Typography, Button } from "@mui/material";

export const ScenarioBMPForm = forwardRef(function ScenarioBMPForm(
  { facilitySetter, facility },
  ref
) {
  const [specs, setSpecs] = useState({
    context: {},
    facilitySpec: {},
  });
  const [facilityType, setFacilityType] = useState(() => {
    let res;
    if (facility.features?.length > 0) {
      res = facility.features[0].properties["facility_type"] || "no_treatment";
    } else {
      res = "no_treatment";
    }
    console.log("Setting initial facility type: ", res);

    return res;
  });
  const [loadingState, setLoadingState] = useState(true);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultError, setResultError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("error!");
  const childRef = useRef(null);

  // console.log("Facility within detail form: ", facility);
  // Allows parent components to perform form functions
  useImperativeHandle(
    ref,
    () => {
      return {
        async triggerValidation(facility) {
          console.log("Validating facility:", facility);
          const isFormValid = await childRef.current.triggerValidation();
          console.log("BMP form valid?: ", isFormValid);
          const isFeatureDrawn =
            facility.features.length > 0 && facility.features[0].geometry;
          console.log("BMP drawn?:", isFeatureDrawn);
          return isFormValid && isFeatureDrawn;
        },

        async resetForm() {
          childRef.current.resetForm();
          facilitySetter({
            type: "FeatureCollection",
            features: [],
          });
        },

        handleSubmit(facility) {
          console.log("Facility within the bmp form ref: ", facility);
          const formData = childRef.current._getValues();
          // const isSimple = childRef.current.getIsSimple();
          _handleSubmit(formData, facility);
        },
      };
    },
    []
  );

  useEffect(() => {
    // OpenAPI spec holds the base facility types used by nereid
    // Context endpoint holds mapping between project-specific names and base types
    let resources = ["/openapi.json", "/api/rest/reference/context"];

    setLoadingState(true);

    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        setSpecs({
          facilitySpec: resArray[0].components.schemas,
          context: resArray[1].api_recognize.treatment_facility.facility_type,
        });
      })
      .then(() => {
        setLoadingState(false);
      });
  }, []);

  function _handleSubmit(data, facility) {
    console.log("Submitting bmp data: ", data);
    console.log("Existing facility:", facility);
    if (
      facilityType.match("_simple") &&
      !data["facility_type"].match("_simple")
    ) {
      console.log("Appending simple");
      data["facility_type"] = data["facility_type"] + "_simple";
    }

    facilitySetter({
      type: "FeatureCollection",
      features: [
        {
          ...facility?.features[0],
          properties: data,
        },
      ],
    });
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
      let fType = facilityType || "drywell";
      let fTypeRoot = fType.replaceAll("_simple", "");

      let simpleBaseType;
      if (fTypeRoot === "no_treatment") {
        simpleBaseType = specs.context[fTypeRoot].validator; //no_treatment has no simple equivalent
      } else {
        simpleBaseType = specs.context[fTypeRoot + "_simple"].validator;
      }
      let baseType = specs.context[fTypeRoot].validator;

      let facilityFields = specs.facilitySpec[baseType];
      let simpleFacilityFields = specs.facilitySpec[simpleBaseType];
      return (
        <React.Fragment>
          <BMPForm
            allFields={facilityFields}
            simpleFields={simpleFacilityFields}
            values={
              facility.features.length > 0
                ? facility.features[0].properties
                : {}
            }
            allFacilities={specs.context}
            currentFacility={facilityType}
            facilityChangeHandler={setFacilityType}
            handleFormSubmit={_handleSubmit}
            ref={childRef}
            context="scenario"
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
        </React.Fragment>
      );
    }
  }

  return <>{!loadingState && renderForm()}</>;
});
