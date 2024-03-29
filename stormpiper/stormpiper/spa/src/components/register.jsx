import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SimpleCardForm from "./forms/simpleCardForm";
import { Box, Typography, TextField, Button } from "@mui/material";
import { api_fetch } from "../utils/utils";
import { staticTheme, ThemeProvider } from "../theme";

export default function Register() {
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
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      defaultValue: "",
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      defaultValue: "",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      required: true,
      defaultValue: "",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      defaultValue: "",
      minLength: {
        value: 8,
        message: "Password must be longer than 8 characters",
      },
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
    let fieldBox = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.name} width={300}>
          {
            <TextField
              {...register(formField.name, { ...formField })}
              label={formField.label}
              type={formField.type}
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
    return fieldBox;
  }

  async function _handleSubmit(data, e) {
    delete data.confirm_password;
    const formData = new FormData(e.target);
    const response = await api_fetch("/auth/register", {
      credentials: "same-origin",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    }).then((resp) => {
      if (resp.status > 200 && resp.status < 300) {
        console.log("success", resp);
        setSuccess(true);
        setError(false);
      } else {
        console.warn("register failure", resp);
        setError(true);
      }
    });
    return response;
  }

  return (
    <ThemeProvider theme={staticTheme}>
      <SimpleCardForm>
        <Typography align="center" variant="subtitle1">
          Enter Your New Account Information
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
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button color="primary" onClick={() => navigate("/app/login")}>
                Return to Login
              </Button>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </Box>
          </form>
        </Box>
        {error && (
          <Typography
            variant="caption"
            color={(theme) => theme.palette.warning.main}
            align="center"
          >
            User already exists
          </Typography>
        )}
        {success && (
          <Typography
            variant="caption"
            color={(theme) => theme.palette.success.main}
            align="center"
          >
            Successfully registered - Check your email for a confirmation link,
            and return to{" "}
            <a href="#" onClick={() => navigate("/app/login")}>
              Login
            </a>
          </Typography>
        )}
      </SimpleCardForm>
    </ThemeProvider>
  );
}
