import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  facilitySpec: object;
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
  showSubmit?: boolean;
  formDataEmitter?: Function;
  formDisabled?: boolean;
};

export const BMPForm = forwardRef(function BMPForm(props: formProps, ref) {
  console.log("BMP Form props:", Object.keys(props));
  const formDisabled = props.formDisabled ?? false;
  const showSubmit = props?.showSubmit ?? true;
  const costFields = props?.facilitySpec?.["TMNTFacilityCostPatch"] || {};
  const firstRender = useRef(true);
  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    reset,
    getValues,
    trigger,
    formState: { errors },
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
    return isSimple ? props.simpleFields : props.allFields;
  });
  const [formFields, setFormFields] = useState(() => {
    return _buildFields();
  });
  const [isTouched, setIsTouched] = useState(false);

  useImperativeHandle(
    ref,
    () => {
      return {
        async triggerValidation() {
          const formValidation = await trigger();
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
  }, [isSimple, props.currentFacility, props.facilityType]);

  useEffect(() => {
    console.log("Building form fields with values: ", props.values);
    isSimple ? setFields(props.simpleFields) : setFields(props.allFields);
    setFormFields(_buildFields());
  }, [isSimple, fields, props.values]);

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
    const _fields = {
      ...fields.properties,
      ...(costFields?.properties || {}),
    };
    Object.keys(_fields).map((k: string) => {
      let v: any = _fields[k];
      let numDefault = Object.keys(costFields?.properties || {}).includes(k)
        ? null
        : 0;
      if (!hiddenFields.includes(k)) {
        let fieldObj = {
          fieldID: k,
          label: v.title,
          type: v.type,
          required:
            fields.required.includes(k) || costFields?.required?.includes(k),
          value: props.values
            ? props.values[k]
              ? props.values[k]
              : v.default
              ? v.default
              : v.type === "string"
              ? ""
              : numDefault
            : v.type === "string"
            ? ""
            : numDefault,
        };
        if (k === "facility_type" && !props.values[k]) {
          fieldObj.value = "no_treatment";
        }
        res.push(fieldObj);
      }
    });

    return res;
  }

  function _createDefaults(
    simpleStatus: boolean | undefined,
    includeExistingValues: boolean = true
  ) {
    let fieldSet: bmpFields;
    let defaultValues: {
      [x: string]: string | number | boolean | null | undefined;
    } = {};
    simpleStatus
      ? (fieldSet = props.simpleFields)
      : (fieldSet = props.allFields);
    Object.keys(fieldSet.properties).map((k) => {
      if (!hiddenFields.includes(k)) {
        let resetValue;
        let numDefault = Object.keys(costFields?.properties || {}).includes(k)
          ? null
          : 0;

        if (includeExistingValues) {
          resetValue =
            props.values && fieldSet.properties[k]
              ? props.values[k]
              : fieldSet.properties[k].default
              ? fieldSet.properties[k].default
              : fieldSet.properties[k].type === "string"
              ? ""
              : numDefault;
        } else {
          resetValue = fieldSet.properties[k].default
            ? fieldSet.properties[k].default
            : fieldSet.properties[k].type === "string"
            ? ""
            : numDefault;
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
      if (!hiddenFields.includes(k) || !["node_id"].includes(k)) {
        unregister(k, { keepValue: false });
      }
    });
    console.log("Form should be clear: ", getValues());
  }

  const wqFormFields = formFields.filter((k) =>
    Object.keys(
      isSimple ? props.simpleFields.properties : props.allFields.properties
    ).includes(k.fieldID)
  );
  const costFormFields = formFields.filter((k) =>
    Object.keys(costFields?.properties || {}).includes(k.fieldID)
  );

  function _renderSimpleCheckDiv() {
    return (
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
            disabled={formDisabled}
          />
        }
        label="Simple Facility?"
      />
    );
  }

  function _formFieldDiv(
    formFields: [
      {
        fieldID: string;
        label: string;
        type: string;
        required: boolean;
        value: string | number;
      }
    ]
  ) {
    if (formFields.length === 0) return;
    console.log("Rendering Form for: ", props.currentFacility);
    console.log("With fields:", formFields);
    const fieldDiv = Object.values(formFields).map(
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
                {...register(formField.fieldID, {
                  required: formField.required
                    ? "This field is required"
                    : false,
                })}
                label={formField.label}
                select
                value={props.currentFacility.replace("_simple", "")}
                onChange={(e) => {
                  reset(_createDefaults(isSimple, false));
                  props.facilityChangeHandler(
                    e.target.value + (isSimple ? "_simple" : "")
                  );
                }}
                onClick={() => setIsTouched(true)}
                disabled={formDisabled}
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
                  required: formField.required
                    ? "This field is required"
                    : false,
                })}
                type={formField.type}
                defaultValue={formField.value}
                required={formField.required}
                label={formField.label}
                inputProps={{
                  step: formField.type === "number" ? 0.01 : null,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={
                  (formField.label === "Node Id" && showSubmit) || formDisabled //having showSubmit disabled the field is a workaround to disable it only in the scenario version of this form
                }
                onClick={() => setIsTouched(true)}
              />
            )}
            {errors[formField.fieldID] && (
              <Typography
                variant="caption"
                sx={{ color: (theme) => theme.palette.warning.main }}
                align="center"
              >
                {errors[formField.fieldID]?.message}
              </Typography>
            )}
          </Box>
        );
      }
    );
    Object.values(formFields).map((formField) => {
      setValue(formField.fieldID, formField.value);
    });

    return fieldDiv;
  }

  function _renderFormFields(
    formFields: [
      {
        fieldID: string;
        label: string;
        type: string;
        required: boolean;
        value: string | number;
      }
    ]
  ) {
    return (
      <Box
        sx={{
          display: "grid",
          py: 2,
          gridTemplateColumns: { md: "1fr 50%" },
          gap: 2,
        }}
      >
        {_formFieldDiv(formFields)}
      </Box>
    );
  }

  function _renderSubmitButtons() {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="contained" type="submit" disabled={!isTouched}>
          Save
        </Button>
        <Button onClick={props.handleEditReset} disabled={!isTouched}>
          Cancel
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {showSubmit && (
        <Typography variant="h6">
          {props.values?.altid} Facility Details
        </Typography>
      )}
      <form
        onSubmit={handleSubmit((data) => {
          Object.keys(data).forEach(
            (k) => (data[k] = data[k] === "" ? null : data[k])
          );
          props.handleFormSubmit(data, isSimple);
        })}
        onChange={() => {
          if (props.formDataEmitter) {
            props.formDataEmitter(getValues());
          }
        }}
      >
        <Typography variant="subtitle2">Water Quality Parameters</Typography>
        {props.simpleFields && _renderSimpleCheckDiv()}
        {_renderFormFields(wqFormFields)}
        <Accordion
          sx={{ my: 2 }}
          disabled={formDisabled}
          onClick={() => setIsTouched(true)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Cost Analysis Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {costFormFields.length > 0 && _renderFormFields(costFormFields)}
          </AccordionDetails>
        </Accordion>
        {showSubmit && _renderSubmitButtons()}
      </form>
    </Box>
  );
});
