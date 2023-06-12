import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, TextField, Typography } from "@mui/material";

export const ScenarioInfoForm = forwardRef(function ScenarioInfoForm(
  { scenario, scenarioSetter, formDisabled, showHelperText },
  ref
) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    getValues,
    reset,
  } = useForm();
  const disabled = formDisabled ?? false;
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const fields = [
    {
      fieldID: "name",
      label: "Scenario Name",
      type: "text",
      required: true,
      minLength: 1,
      defaultValue: scenario?.name || "",
    },
    {
      fieldID: "purpose",
      label: "Purpose",
      type: "text",
      required: false,
      defaultValue: scenario?.info?.purpose || "",
      inputProps: {
        minRows: 3,
        multiline: true,
      },
    },
    {
      fieldID: "description",
      label: "Description",
      type: "text",
      required: false,
      defaultValue: scenario?.info?.description || "",
    },
  ];

  useEffect(() => {
    reset({
      name: scenario?.name || "",
      purpose: scenario?.info?.purpose || "",
      description: scenario?.info?.description || "",
    });
  }, [scenario]);

  useImperativeHandle(
    ref,
    () => {
      return {
        async triggerValidation() {
          const formValidation = await trigger();
          const formValid = formValidation;
          return formValid;
        },

        async resetForm() {
          scenarioSetter({
            name: "",
            info: {
              description: "",
              purpose: "",
            },
            input: {
              delineation_collection: null,
              tmnt_facility_collection: null,
            },
          });
        },
      };
    },
    []
  );

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      const { ref: inputRef, ...inputProps } = register(formField.fieldID, {
        required: formField.required ? "This field is required" : false,
      });
      return (
        <Box key={formField.fieldID} sx={{ width: "100%" }}>
          {
            <TextField
              inputRef={inputRef}
              key={formField.fieldID}
              label={formField.label}
              type={formField.type}
              defaultValue={formField.defaultValue}
              required={formField.required}
              margin="dense"
              {...inputProps}
              onChange={(e) => {
                scenarioSetter(formField.fieldID, e.target.value);
              }}
              fullWidth
              disabled={disabled}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .Mui-disabled": {
                  WebkitTextFillColor: "rgba(0,0,0,0.7)",
                },
              }}
            />
          }

          {errors[formField.fieldID] && (
            <Typography
              variant="caption"
              sx={{ color: (theme) => theme.palette.warning.main }}
            >
              {errors[formField.fieldID]?.message}
            </Typography>
          )}
        </Box>
      );
    });
    return fieldDiv;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {showHelperText && (
        <Typography variant="body2" sx={{ mt: 1, mb: 2, pb: 1 }}>
          <strong>Start by describing your scenario below</strong>
        </Typography>
      )}
      <Box
        component="form"
        noValidate
        autoComplete="off"
        sx={{ width: "100%" }}
      >
        {_renderFormFields()}
      </Box>
    </Box>
  );
});
