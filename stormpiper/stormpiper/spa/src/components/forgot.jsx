import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Typography, TextField, Button, Box } from "@mui/material";
import SimpleCardForm from "./forms/simpleCardForm";
import { api_fetch } from "../utils/utils";
import { staticTheme, ThemeProvider } from "../theme";

export default function Forgot() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const fields = [
    {
      name: "username",
      label: "username/email",
      type: "email",
      required: true,
      defaultValue: "",
    },
  ];

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.name} width={300}>
          {
            <TextField
              {...register(formField.name, { ...formField })}
              label={formField.label}
              type={formField.type}
              required={formField.required}
              fullWidth
              margin="normal"
            />
          }
          {errors[formField.name] && (
            <Typography
              variant="caption"
              align="center"
              color={(theme) => theme.palette.warning.main}
            >
              {errors[formField.name]?.message}
            </Typography>
          )}
        </Box>
      );
    });
    return fieldDiv;
  }

  async function _handleSubmit() {
    const response = await api_fetch("/auth/forgot-password", {
      credentials: "same-origin",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: getValues().username }),
    }).then((resp) => {
      if (resp.status == 202) {
        setError(false);
        setSuccess(true);
      } else {
        console.warn("login failure", resp);
        setError(true);
        setSuccess(false);
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
          <form
            onSubmit={handleSubmit(_handleSubmit)}
            sx={{
              display: "flex",
              width: "300px",
            }}
          >
            {_renderFormFields()}

            <Box sx={{ display: "flex", justifyContent: "right", my: 3 }}>
              <Button color="primary" variant="contained" type="submit">
                Send Reset Link
              </Button>
            </Box>
            {success && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography
                  variant="caption"
                  color={(theme) => theme.palette.success.main}
                  align="center"
                >
                  A reset link was sent to the email associated with this
                  account <br />
                  Use the link to reset your email, and return to login
                </Typography>
              </Box>
            )}
          </form>
        </Box>
      </SimpleCardForm>
    </ThemeProvider>
  );
}
