import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Typography, TextField, Button, Box } from "@mui/material";
import { api_fetch } from "../utils/utils";
import SimpleCardForm from "./forms/simpleCardForm";
import { staticTheme, ThemeProvider } from "../theme";

export default function Reset() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  // const [resetContents, setResetContents] = useState(
  //   <>
  //     <Typography variant="subtitle1">Checking your reset link...</Typography>
  //   </>
  // );
  const [searchParams, setSearchParams] = useSearchParams();

  let expiresAt = searchParams.get("expires_at");
  const token = searchParams.get("token");

  let now = new Date();
  let expiryDateFormatted = new Date(expiresAt);

  const fields = [
    {
      name: "password",
      label: "New Password",
      type: "password",
      defaultValue: "",
      minLength: {
        value: 8,
        message: "Password must be longer than 8 characters",
      },
      required: true,
    },
    {
      name: "confirm_password",
      label: "Confirm Password",
      type: "password",
      required: true,
      defaultValue: "",
      validate: (val) =>
        val === getValues("password") || "Passwords don't match",
    },
  ];

  function _renderFormFields() {
    console.log("Rendering fields. Any errors?:", errors);
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.name} sx={{ mb: 3 }}>
          {
            <TextField
              fullWidth
              {...register(formField.name, { ...formField })}
              label={formField?.label || ""}
              type={formField?.type || "text"}
              defaultValue={formField.defaultValue}
              required={formField.required}
            />
          }
          {errors[formField.name] && (
            <Typography
              variant="caption"
              sx={{ color: (theme) => theme.palette.warning.main }}
              align="center"
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
    console.log("formData: ", formData);
    data = { ...Object.fromEntries(formData.entries()), token };

    const response = await api_fetch("/auth/reset-password", {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((resp) => {
      if (resp.status == 200) {
        setError(false);
        setSuccess(true);
      } else {
        console.warn("reset failure", resp);
        setError(true);
        setSuccess(false);
      }
    });
    return response;
  }

  return (
    <ThemeProvider theme={staticTheme}>
      <SimpleCardForm>
        {now > expiryDateFormatted ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column ",
            }}
          >
            <Typography align="center" variant="subtitle1">
              Sorry, your password reset link has expired
            </Typography>
            <Typography align="center" variant="subtitle2">
              Please request another{" "}
              <a href="#" onClick={() => navigate("/app/forgot-password")}>
                reset link
              </a>
            </Typography>
          </Box>
        ) : (
          <>
            <Typography align="center" variant="subtitle1">
              {" "}
              Welcome to the Tacoma Watershed Insights Tool
            </Typography>
            <Typography align="center" variant="subtitle2">
              {" "}
              Enter your new password below
            </Typography>
            <Box
              sx={{
                margin: "1em",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <form
                sx={{ display: "flex", flexDirection: "column", width: 300 }}
                onSubmit={handleSubmit(_handleSubmit)}
              >
                {_renderFormFields()}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                  }}
                >
                  <Button variant="contained" type="submit" color="primary">
                    Submit
                  </Button>
                </Box>
              </form>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {error && (
                <Typography
                  variant="caption"
                  color={(theme) => theme.palette.warning.main}
                  align="center"
                >
                  Password reset failed. Please request a new{" "}
                  <a href="#" onClick={() => navigate("/app/forgot-password")}>
                    reset link
                  </a>
                </Typography>
              )}
              {success && (
                <Typography
                  variant="caption"
                  color={(theme) => theme.palette.success.main}
                  align="center"
                >
                  Your password was reset successfully. Please{" "}
                  <a href="#" onClick={() => navigate("/app/login")}>
                    login
                  </a>
                </Typography>
              )}
            </Box>
          </>
        )}
      </SimpleCardForm>
    </ThemeProvider>
  );
}
