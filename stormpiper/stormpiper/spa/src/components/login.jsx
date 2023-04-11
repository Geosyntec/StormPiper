import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";
import { api_fetch } from "../utils/utils";
import { staticTheme, ThemeProvider } from "../theme";
import SimpleCardForm from "./forms/simpleCardForm";

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState(false);
  const fields = [
    {
      fieldID: "username",
      label: "username",
      type: "email",
      required: true,
      value: "",
    },
    {
      fieldID: "password",
      label: "password",
      type: "password",
      required: true,
      value: "",
    },
  ];

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.fieldID} width={300}>
          {
            <TextField
              {...register(formField.fieldID)}
              label={formField.label}
              type={formField.type}
              defaultValue={formField.value}
              required={formField.required}
              margin="normal"
              fullWidth
            />
          }
          {errors[formField.name] && (
            <Typography
              variant="caption"
              sx={{ color: (theme) => theme.palette.warning.main }}
            >
              {errors[formField.name]?.message}
            </Typography>
          )}
        </Box>
      );
    });
    return fieldDiv;
  }

  async function _handleSubmit(data, e) {
    console.log("Event: ", e);
    const formData = new FormData(e.target);
    const response = await api_fetch("/auth/jwt-cookie/login", {
      credentials: "same-origin",
      method: "POST",
      body: formData,
    }).then((resp) => {
      if (resp.status == 200) {
        console.log("redirect on success");
        setError(false);
        navigate("/app");
      } else {
        console.warn("login failure", resp);
        setError(true);
      }
    });

    return response;
  }

  return (
    <ThemeProvider theme={staticTheme}>
      <SimpleCardForm>
        <Typography variant="subtitle1" align="center">
          Welcome to the Tacoma Watershed Insights Tool
        </Typography>
        <Typography variant="subtitle2" align="center">
          Login or Register to get Started
        </Typography>
        <Box
          sx={{
            margin: "1em",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <form onSubmit={handleSubmit(_handleSubmit)}>
            {_renderFormFields()}

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  color="primary"
                  onClick={() => navigate("/app/register")}
                >
                  Register
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  Login
                </Button>
              </Box>
            </Box>

            {error && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography
                  variant="caption"
                  align="center"
                  color={(theme) => theme.palette.warning.main}
                >
                  Incorrect username/password - please try again
                </Typography>
              </Box>
            )}
          </form>
        </Box>
        <Box>
          <Typography align="center" variant="body2">
            <a
              href="#"
              onClick={() => {
                navigate("/app/forgot-password");
              }}
            >
              Forgot your password?
            </a>
          </Typography>
        </Box>
      </SimpleCardForm>
    </ThemeProvider>
  );
}
