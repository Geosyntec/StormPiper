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
  InputAdornment,
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
import { BMPReadOnlyInfo } from "./bmp-detail-page/bmp-basic-info";
import { KCBMPDetailModal } from "./cost-estimator/kc-estimator-modal";
import { fieldAlias } from "./fieldAlias";

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

function getFieldAdornment(k) {
  const cost = <InputAdornment position="start">$</InputAdornment>;
  const pct = <InputAdornment position="end">%</InputAdornment>;
  const knownAdornments = {
    captured_pct: { endAdornment: pct },
    retained_pct: { endAdornment: pct },
    om_cost_per_yr: { startAdornment: cost },
    capital_cost: { startAdornment: cost },
    replacement_cost: { startAdornment: cost },
  };

  return knownAdornments?.[k];
}

function getFieldOverrides(k) {
  const knownOverrides = {
    capital_cost_basis_year: { type: "number", step: 1 },
    om_cost_basis_year: { type: "number", step: 1 },
    install_year: { type: "number", step: 1 },
    lifespan_yrs: { type: "number", step: 1 },
  };

  return knownOverrides?.[k];
}

export const BMPForm = forwardRef(function BMPForm(props: formProps, ref) {
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
    formState: { errors, isValid },
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
  const [wqSubForm, setWQSubForm] = useState(() => <Box></Box>);
  const [costSubForm, setCostSubForm] = useState(() => <Box></Box>);

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
    if (!firstRender.current) {
      //Don't do this on first render to avoid set value before field is registered
      _clearForm(isSimple);
      reset(_createDefaults(isSimple));
    }
    firstRender.current = false;

    isSimple ? setFields(props.simpleFields) : setFields(props.allFields);
    setFormFields(_buildFields());
  }, [isSimple, fields, props.values, props.currentFacility, formDisabled]);

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
    const _fields = {
      ...fields.properties,
      ...(costFields?.properties || {}),
    };
    Object.keys(_fields).map((k: string) => {
      let v: any = _fields[k];
      const overrides = getFieldOverrides(k);
      const is_cost_field = Object.keys(costFields?.properties || {}).includes(
        k
      );
      let numDefault = is_cost_field ? null : 0;

      if (!hiddenFields.includes(k)) {
        let fieldObj = {
          fieldID: k,
          label: fieldAlias?.[k] || v.title,
          type: overrides?.type
            ? overrides.type
            : typeof v?.type === "string" || v?.type instanceof String
            ? v.type
            : "string",
          required:
            fields.required.includes(k) ||
            costFields?.required?.includes(k) ||
            false,
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
          adornment: getFieldAdornment(k),
          step: overrides?.step || null,
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
  }

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
              setIsTouched(true);
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
    const fieldDiv = Object.values(formFields).map(
      (formField: {
        fieldID: string;
        label: string;
        type: string;
        required: boolean;
        value: string | number;
      }) => {
        const { ref: inputRef, ...inputProps } = register(formField.fieldID, {
          required: formField.required ? "This field is required" : false,
        });
        return (
          <Box key={formField.fieldID}>
            {formField.fieldID === "facility_type" ? (
              <TextField
                fullWidth
                inputRef={inputRef}
                key={formField.fieldID}
                variant="outlined"
                label={formField.label}
                select
                value={props.currentFacility.replace("_simple", "")}
                required={formField.required}
                {...inputProps}
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
                inputRef={inputRef}
                id={formField.fieldID}
                variant="outlined"
                type={formField.type}
                defaultValue={formField.value}
                required={formField.required}
                label={formField.label}
                {...inputProps}
                inputProps={{
                  step:
                    formField.type === "number"
                      ? formField?.step || 0.01
                      : null,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  ...formField.adornment,
                }}
                disabled={
                  (formField.fieldID === "node_id" && showSubmit) ||
                  formDisabled //having showSubmit disabled the field is a workaround to disable it only in the scenario version of this form
                }
                onClick={() => setIsTouched(true)}
                onFocus={(e) => e.target.select()}
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
      const valueToSet = getValues(formField.fieldID) || formField.value;
      setValue(formField.fieldID, valueToSet);
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

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const wqFormFields = formFields.filter((k) =>
    Object.keys(
      isSimple ? props.simpleFields.properties : props.allFields.properties
    ).includes(k.fieldID)
  );
  const costFormFields = formFields.filter((k) =>
    Object.keys(costFields?.properties || {}).includes(k.fieldID)
  );

  return (
    <Box>
      {showSubmit && (
        <Typography variant="h6">
          {props.values?.altid} Facility Details
        </Typography>
      )}
      <BMPReadOnlyInfo data={props.values} />
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
        <Accordion sx={{ my: 2 }} onClick={() => setIsTouched(true)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Cost Analysis Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <>
              {_renderFormFields(costFormFields)}

              <Button onClick={handleModalOpen}>
                King County Cost Estimator Tool
              </Button>
            </>
          </AccordionDetails>
        </Accordion>
        {showSubmit && _renderSubmitButtons()}
      </form>

      <KCBMPDetailModal
        initialBMPType={props.currentFacility}
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        handleApply={function (res) {
          setValue("capital_cost", Math.round(res.capital_cost));
          setValue("capital_cost_basis_year", 2023);
          setValue("om_cost_per_yr", Math.round(res.om_cost_per_yr));
          setValue("om_cost_basis_year", 2023);
          props.formDataEmitter(getValues());
        }}
        disableApply={formDisabled}
      />
    </Box>
  );
});
