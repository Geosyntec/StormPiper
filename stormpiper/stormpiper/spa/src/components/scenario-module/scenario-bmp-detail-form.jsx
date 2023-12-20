import {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { api_fetch } from "../../utils/utils";
import { BMPForm } from "../bmpForm";
import {
  Box,
  Dialog,
  DialogActions,
  Typography,
  Button,
  List,
} from "@mui/material";

export const ScenarioBMPForm = forwardRef(function ScenarioBMPForm(
  { facilitySetter, facility, formDisabled, showHelperText },
  ref
) {
  const disabled = formDisabled ?? false;
  const [specs, setSpecs] = useState({
    context: {},
    facilitySpec: {},
  });
  const [facilityType, setFacilityType] = useState(() => {
    let res;
    if (facility?.features?.length > 0) {
      res = facility.features[0].properties["facility_type"] || "no_treatment";
    } else {
      res = "no_treatment";
    }

    return res;
  });
  const [loadingState, setLoadingState] = useState(true);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultError, setResultError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("error!");
  const childRef = useRef(null);

  // Allows parent components to perform form functions
  useImperativeHandle(
    ref,
    () => {
      return {
        async triggerValidation(facility) {
          const isFormValid = await childRef.current.triggerValidation();
          const isFeatureDrawn =
            facility?.features.length > 0 &&
            facility?.features[0]?.geometry?.coordinates?.length > 0;
          return isFormValid && isFeatureDrawn;
        },

        async resetForm() {
          childRef.current.resetForm();
          facilitySetter(null);
        },

        handleSubmit(facility) {
          const formData = childRef.current._getValues();
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
    Object.keys(data).forEach(
      (k) => (data[k] = data[k] === "" ? null : data[k])
    );
    facilitySetter({
      type: "FeatureCollection",
      features: [
        {
          ...facility?.features[0],
          properties: data,
          type: "Feature",
        },
      ],
    });
  }
  function _handleRecalculate() {
    api_fetch("/api/rpc/solve_watershed")
      .then((resp) => {
        setResultSuccess(false);
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

  function formOnChangeHandler(data) {
    _handleSubmit(data, facility);
  }

  function facilityChangeHandler(newFacilityType) {
    setFacilityType(newFacilityType);
  }

  function renderForm() {
    if (loadingState) {
      return <p>loading...</p>;
    } else {
      let fType = facilityType || "no_treatment";
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          {showHelperText && (
            <Typography variant="body2" sx={{ mt: 1, mb: 4, pb: 1 }}>
              <strong>
                Draw a BMP facility on the map, and give it some performance and
                cost parameters
              </strong>
            </Typography>
          )}
          <BMPForm
            facilitySpec={specs.facilitySpec}
            allFields={facilityFields}
            simpleFields={simpleFacilityFields}
            values={
              facility?.features.length > 0
                ? facility.features[0].properties
                : {}
            }
            allFacilities={specs.context}
            currentFacility={facilityType}
            facilityChangeHandler={facilityChangeHandler}
            ref={childRef}
            showSubmit={false}
            formDataEmitter={formOnChangeHandler}
            formDisabled={disabled}
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
            <Box sx={{ p: 2 }}>
              <Typography>
                <strong>Error Saving Scenario</strong>
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ py: 0, px: 2 }}>
              {errorMsg && _renderErrorHeader(errorMsg)}
            </Typography>
            <List sx={{ mt: 0, pr: 1 }}>
              {_getErrorList(errorMsg).map((msg, i) => {
                return (
                  <ListItem key={i}>
                    <Typography variant="caption">{msg}</Typography>
                  </ListItem>
                );
              })}
            </List>
          </Dialog>
        </Box>
      );
    }
  }

  return <>{!loadingState && renderForm()}</>;
});
