import { forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";
import { api_fetch } from "../../utils/utils";

export const ScenarioInfoForm = forwardRef(function ScenarioInfoForm(
  { scenario, scenarioSetter },
  ref
) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const fields = [
    {
      fieldID: "name",
      label: "Scenario Name",
      type: "text",
      required: true,
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

  useImperativeHandle(
    ref,
    () => {
      return {
        async triggerValidation(scenarioObject) {
          const formValidation = await trigger();
          return formValidation;
        },
      };
    },
    []
  );

  function _renderFormFields() {
    console.log("Building scenario info fields: ", fields);
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
                console.log("Form errors: ", errors);
                scenarioSetter(formField.fieldID, e.target.value);
              }}
              {...formField.inputProps}
              fullWidth
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
          {/* <TextField
            key={formField.fieldID}
            label="there"
            defaultValue="hello"
          ></TextField> */}
        </Box>
      );
    });
    return fieldDiv;
  }

  async function _handleSubmit(data) {
    const formData = {
      ...scenario,
      name: data.name,
      info: { purpose: data.purpose, description: data.description },
    };
    console.log("Submitting scenario: ", formData);
    // const response = await api_fetch("/api/rest/scenario", {
    //   credentials: "same-origin",
    //   headers: {
    //     accept: "application/json",
    //     "Content-type": "application/json",
    //   },
    //   method: "POST",
    //   body: JSON.stringify(formData),
    // }).then((resp) => {
    //   if (resp.status == 200) {
    //     console.log("redirect on success");
    //     setSuccess(true);
    //     setError(false);
    //   } else {
    //     console.warn("login failure", resp);
    //     setError(true);
    //   }
    // });

    return response;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        component="form"
        noValidate
        autoComplete="off"
        sx={{ width: "100%" }}
        onSubmit={handleSubmit(_handleSubmit)}
      >
        {_renderFormFields()}

        {/* {errors && (
            <Box sx={{ my: "2rem", display: "flex", justifyContent: "start" }}>
              <Typography
                variant="caption"
                align="left"
                color={(theme) => theme.palette.warning.main}
              >
                Something went wrong - please try again
              </Typography>
            </Box>
          )}
          {success && (
            <Box sx={{ my: "2rem", display: "flex", justifyContent: "start" }}>
              <Typography
                variant="caption"
                align="left"
                color={(theme) => theme.palette.success.main}
              >
                Scenario created successfully
              </Typography>
            </Box>
          )} */}
      </Box>
    </Box>
  );
});
