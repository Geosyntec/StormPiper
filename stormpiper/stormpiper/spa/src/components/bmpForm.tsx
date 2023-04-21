import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { api_fetch } from "../utils/utils";

const hiddenFields: string[] = [
  "ref_data_key",
  "design_storm_depth_inches",
  "eliminate_all_dry_weather_flow_override",
  "is_online",
];

type bmpFields = {
  title: string;
  required: string[];
  type: string;
  properties: {
    [x: string]: { [x: string]: string | number | boolean };
  };
};

type formProps = {
  allFields: bmpFields;
  simpleFields: bmpFields;
  values: {
    [x: string]: string | number;
  };
  currentFacility: string;
  facilityChangeHandler: Function;
  allFacilities: {
    [x: string]: { [x: string]: string };
  };
  handleFormSubmit: Function;
  context: string;
};

export const BMPForm = forwardRef(function BMPForm(props: formProps, ref) {
  console.log("BMP Form props:", Object.keys(props));
  const firstRender = useRef(true);
  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    reset,
    getValues,
    trigger,
  } = useForm();
  const [isSimple, setIsSimple] = useState(() => {
    if (typeof props.values?.facility_type === "string") {
      if (props.values.facility_type.match("_simple")) {
        return true;
      } else {
        return false;
      }
    }
  });
  const [fields, setFields] = useState(() => {
    let emptyFields: bmpFields = {
      title: "",
      required: [],
      type: "",
      properties: {},
    };
    return emptyFields;
  });
  const [formFields, setFormFields] = useState(() => {
    return _buildFields();
  });

  useImperativeHandle(
    ref,
    () => {
      return {
        async triggerValidation() {
          const formValidation = await trigger();
          console.log("BMP form valid?: ", formValidation);
          return formValidation;
        },

        async resetForm() {
          reset(_createDefaults(isSimple, false));
        },

        _getValues() {
          console.log("Values within ref: ", getValues());
          return getValues();
        },

        getIsSimple() {
          return isSimple;
        },
      };
    },
    []
  );

  useEffect(() => {
    console.log("is this the first render: ", firstRender.current);
    if (!firstRender.current) {
      //Don't do this on first render to avoid set value before field is registered
      _clearForm(isSimple);
      reset(_createDefaults(isSimple));
    }
    isSimple ? setFields(props.simpleFields) : setFields(props.allFields);
    firstRender.current = false;
  }, [isSimple, props.currentFacility]);

  useEffect(() => {
    console.log("Building form fields with values: ", props.values);
    setFormFields(_buildFields());
  }, [isSimple, fields]);

  function _buildFields(): {
    fieldID: string;
    label: string;
    type: string;
    required: boolean;
    value: string | number;
  }[] {
    let res: {
      fieldID: string;
      label: string;
      type: string;
      required: boolean;
      value: string | number;
    }[] = [];
    console.log("initial form values: ", props.values);
    Object.keys(fields.properties).map((k: string) => {
      let v: any = fields.properties[k];
      if (!hiddenFields.includes(k)) {
        res.push({
          fieldID: k,
          label: v.title,
          type: v.type,
          required: fields.required.includes(k),
          value: props.values
            ? props.values[k] &&
              props.values.facility_type === props.currentFacility
              ? props.values[k]
              : v.default
              ? v.default
              : v.type === "string"
              ? ""
              : 0
            : v.type === "string"
            ? ""
            : 0,
        });
      }
    });
    setValue("node_id", props.values?.node_id);
    setValue("facility_type", props.currentFacility);
    // setValue("facility_type", props.currentFacility.replace("_simple", ""));

    console.log("Finished Building Fields:", res);
    return res;
  }

  function _createDefaults(
    simpleStatus: boolean | undefined,
    includeExistingValues: boolean = true
  ) {
    let fieldSet: bmpFields;
    let defaultValues: { [x: string]: string | number | boolean | undefined } =
      {};
    simpleStatus
      ? (fieldSet = props.simpleFields)
      : (fieldSet = props.allFields);
    Object.keys(fieldSet.properties).map((k) => {
      if (!hiddenFields.includes(k)) {
        let resetValue;
        if (includeExistingValues) {
          resetValue =
            props.values && fieldSet.properties[k].default
              ? fieldSet.properties[k].default
              : fieldSet.properties[k].type === "string"
              ? ""
              : 0;
        } else {
          resetValue = fieldSet.properties[k].default
            ? fieldSet.properties[k].default
            : fieldSet.properties[k].type === "string"
            ? ""
            : 0;
        }
        defaultValues[k] = resetValue;
      } else if (k === "node_id") {
        defaultValues[k] = (props.values && props.values[k]) || "";
      } else if (k === "facility_type") {
        defaultValues[k] = props.currentFacility;
      }
    });
    console.log("reseting form: ", defaultValues);
    return defaultValues;
  }

  function _clearForm(simpleStatus: boolean | undefined) {
    let fieldSet: bmpFields;
    let defaultValues: { [x: string]: string | number | boolean | undefined } =
      {};
    simpleStatus
      ? (fieldSet = props.simpleFields)
      : (fieldSet = props.allFields);
    Object.keys(fieldSet.properties).map((k) => {
      if (
        !hiddenFields.includes(k) ||
        !["node_id", "facility_type"].includes(k)
      ) {
        unregister(k, { keepValue: false });
      }
    });
    console.log("Form should be clear: ", getValues());
  }
  // async function _handleSubmit(data: any) {
  //   if (isSimple && !data["facility_type"].match("_simple")) {
  //     console.log("Appending simple");
  //     data["facility_type"] = data["facility_type"] + "_simple";
  //   }

  //   console.log("Submitting Patch Request: ", data);
  //   const response = await api_fetch(
  //     "/api/rest/tmnt_attr/" + props.values.node_id,
  //     {
  //       credentials: "same-origin",
  //       headers: {
  //         accept: "application/json",
  //         "Content-type": "application/json",
  //       },
  //       method: "PATCH",
  //       body: JSON.stringify(data),
  //     }
  //   )
  //     .then((resp) => {
  //       if (resp.status === 200) {
  //         setResultSuccess(true);
  //       } else if (resp.status === 422) {
  //         setResultError(true);
  //       }
  //       return resp.json();
  //     })
  //     .then((r) => {
  //       //assume that only error responses have a detail object
  //       if (r.detail) {
  //         setErrorMsg(r.detail);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log("Error patching tmnt:");
  //       setResultError(true);
  //       console.log(err);
  //     });
  //   return response;
  // }

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

  function _renderErrorHeader(msg: string) {
    let beginningText: RegExp = /[0-9]*\svalidation (error[s]*)/g;
    let header = msg.match(beginningText);
    if (header) {
      return header[0];
    } else {
      return header;
    }
  }

  function _getErrorList(msg: string): string[] {
    let errorList: string[] = [];

    //Find the number of errors so that we know
    let errorNum = 0;
    let nums = msg.match(/[0-9]*/g);
    if (nums) {
      errorNum = parseInt(nums[0]);
    }

    //Isolate just the list of errors
    let beginningText: RegExp = /[0-9]*\svalidation (error[s]*\sfor\s\w*\s)/g;
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

  function _renderFormFields() {
    let simpleCheckDiv;
    if (formFields) {
      console.log("Rendering Form for: ", props.currentFacility);
      console.log("With fields:", formFields);
      let fieldDiv = Object.values(formFields).map(
        (formField: {
          fieldID: string;
          label: string;
          type: string;
          required: boolean;
          value: string | number;
        }) => {
          return (
            <Box key={formField.fieldID}>
              {formField.fieldID === "facility_type" ? (
                <TextField
                  fullWidth
                  key={formField.fieldID}
                  variant="outlined"
                  label={formField.label}
                  select
                  value={props.currentFacility.replace("_simple", "")}
                  onChange={(e) => {
                    reset(_createDefaults(isSimple));
                    props.facilityChangeHandler(
                      e.target.value + (isSimple ? "_simple" : "")
                    );
                  }}
                >
                  {Object.keys(props.allFacilities).map((fType: string) => {
                    if (!fType.match("_simple")) {
                      return (
                        <MenuItem
                          key={props.allFacilities[fType].label}
                          value={fType}
                          sx={{ overflow: "hidden" }}
                        >
                          {props.allFacilities[fType].label}
                        </MenuItem>
                      );
                    }
                  })}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  id={formField.fieldID}
                  variant="outlined"
                  {...register(formField.fieldID, {
                    required: formField.required,
                  })}
                  type={formField.type}
                  defaultValue={formField.value}
                  required={formField.required}
                  label={formField.label}
                  inputProps={{
                    step: formField.type === "number" ? 0.01 : null,
                  }}
                  disabled={
                    formField.label === "Node Id" && formField.value === null
                  }
                />
              )}
            </Box>
          );
        }
      );
      if (props.simpleFields) {
        simpleCheckDiv = (
          <Box key="simpleCheckBox">
            <FormControlLabel
              control={
                <Switch
                  checked={isSimple}
                  onChange={() => {
                    let facilityType = getValues("facility_type").replaceAll(
                      "_simple",
                      ""
                    );
                    let suffix = isSimple ? "" : "_simple"; //note that isSimple at this stage is the old value, so when the old value is true, we want a non-simple facility
                    let newFacilityType = facilityType + suffix;
                    props.facilityChangeHandler(newFacilityType);
                    setValue("facility_type", newFacilityType);
                    setIsSimple(!isSimple);
                  }}
                  color="primary"
                />
              }
              label="Simple Facility?"
            />
          </Box>
        );
      } else {
        simpleCheckDiv = <Box key="simpleCheckBox"></Box>;
      }
      // console.log("Form Values after building fields: ", getValues());
      return (
        <Box>
          {simpleCheckDiv}
          <Box
            sx={{
              display: "grid",
              py: 2,
              gridTemplateColumns: { md: "1fr 50%" },
              "grid-gap": "2rem",
            }}
          >
            {fieldDiv}
          </Box>
          {props.context === "existing-system" && (
            <Box display="flex" justifyContent="right">
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Box>
          )}
        </Box>
      );
    } else {
      return <Box></Box>;
    }
  }
  return (
    <Box>
      <Typography variant="h6">
        {props.values?.altid} Facility Details
      </Typography>
      <form
        onSubmit={handleSubmit((data) =>
          props.handleFormSubmit(data, isSimple)
        )}
      >
        {_renderFormFields()}
      </form>
    </Box>
  );
});
