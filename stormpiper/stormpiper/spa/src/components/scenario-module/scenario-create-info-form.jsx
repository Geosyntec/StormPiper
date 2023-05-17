import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, TextField, Typography } from "@mui/material";

export const ScenarioInfoForm = forwardRef(function ScenarioInfoForm(
  { scenario, scenarioSetter, formDisabled },
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
      };
    },
    []
  );

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.fieldID} sx={{ width: "100%" }}>
          {
            <TextField
              {...register(formField.fieldID, { ...formField })}
              key={formField.fieldID}
              label={formField.label}
              type={formField.type}
              value={formField.defaultValue}
              required={formField.required}
              margin="dense"
              onChange={(e) => {
                scenarioSetter(formField.fieldID, e.target.value);
              }}
              {...formField.inputProps}
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
      }}
    >
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
