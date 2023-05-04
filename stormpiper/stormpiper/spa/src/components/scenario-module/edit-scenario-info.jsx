import { useState } from "react";
import { useForm } from "react-hook-form";
import { api_fetch, pick } from "../../utils/utils";

import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

const patchDataById = async (id, data) => {
  return await api_fetch(`/api/rest/scenario/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

const makeFormData = (data) => {
  if (data?.info) {
    for (let [k, v] of Object.entries(data.info)) {
      data[`info-${k}`] = v;
    }
  }
  return data;
};

const makeAPIPatchData = (data) => {
  let patchData = {}; //(({name, description}) => ({name, description}))(data)
  let infoData = {};
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith("info-")) {
      infoData[k.replace("info-", "")] = v;
    } else {
      patchData[k] = v;
    }
  }

  patchData.info = infoData;

  return pick(patchData, "name", "info");
};

export function EditScenarioBasics({ data }) {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  let _formValues = makeFormData(data);
  console.log(_formValues);

  const [formValues, setFormValues] = useState({ ..._formValues });

  const scenario_id = data?.id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuccess(false);
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: _formValues });

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box
          sx={{
            mt: 4,
          }}
          key={formField.name}
        >
          {formField?.select ? (
            <TextField
              fullWidth
              {...register(formField.name, { ...formField })}
              label={formField.label}
              type={formField?.type ?? "text"}
              required={formField?.required ?? false}
              value={formValues?.[formField.name] ?? "public"}
              InputProps={formField?.InputProps}
              disabled={formField?.disabled ?? false}
              select
              onChange={handleInputChange}
            >
              {formField?.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              {...register(formField.name, { ...formField })}
              label={formField.label}
              type={formField?.type || "text"}
              required={formField?.required || false}
              value={formValues?.[formField.name] ?? ""}
              InputProps={formField?.InputProps}
              disabled={formField?.disabled || false}
              select={formField?.select || false}
              onChange={handleInputChange}
              {...formField}
            ></TextField>
          )}

          {errors[formField.name] && (
            <p className="form-label error-msg">
              {errors[formField.name]?.message}
            </p>
          )}
        </Box>
      );
    });
    return fieldDiv;
  }

  async function _handleSubmit(data, e) {
    console.log("Event: ", e);
    console.log("Data:", data);

    const formData = new FormData(e.target);

    const sendData = makeAPIPatchData(Object.fromEntries(formData.entries()));

    console.log("sending...", sendData);

    const response = await patchDataById(scenario_id, sendData);

    const rjson = await response.json();

    if (response.status >= 200 && response.status < 300) {
      setSuccess(true);
      setError(false);
      setFormValues(makeFormData(rjson));
    } else {
      console.warn("edit user failure", userid, response, rjson);
      setError(true);
      setSuccess(false);
    }
    return response;
  }

  const fields = [
    {
      name: "name",
      label: "Scenario Name",
    },
    {
      name: "info-description",
      label: "Description",
      minRows: 3,
      multiline: true,
    },
    {
      name: "info-purpose",
      label: "Purpose",
    },
  ];

  return (
    <Box sx={{ width: "90%" }}>
      {/* TODO: check text and variant */}
      <Typography align="center" variant="h5">
        Basic Scenario Information
      </Typography>
      {!data ? (
        <Box>loading...</Box>
      ) : (
        // TODO: add loading spinner
        <Box
          sx={{ width: "100%" }}
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(_handleSubmit)}
        >
          {_renderFormFields()}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "column",
              mt: 4,
            }}
          >
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
            <Box>
              {!error && !success && (
                <Typography variant="caption" align="center">
                  &nbsp;
                </Typography>
              )}
              {error && (
                <Typography variant="caption" color="error" align="center">
                  Edits not stored.
                </Typography>
              )}
              {success && (
                <Typography variant="caption" color="primary" align="center">
                  Success
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
