import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// import "./login.css"
import {
  Box,
  Card,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { TextField, Input, Button } from "@material-ui/core";
import { api_fetch } from "../utils/utils";
import { responsiveFontSizes } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  errorMsg: {
    color: theme.palette.warning.main,
    margin: "5px 20px",
  },
  mainCard: {
    backgroundColor: theme.palette.grey[100],
  },
  mainButton: {
    margin: "1rem",
  },
}));

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, getValues } = useForm();
  const [error, setError] = useState(false);
  const classes = useStyles();
  const fields: {
    fieldID: string;
    label: string;
    type: string;
    required: boolean;
    value: string | number;
  }[] = [
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
    let fieldDiv = Object.values(fields).map(
      (formField: {
        fieldID: string;
        label: string;
        type: string;
        required: boolean;
        value: string | number;
      }) => {
        return (
          <div className="flex auth-form-row">
            {
              <TextField
                {...register(formField.fieldID)}
                label={formField.label}
                type={formField.type}
                defaultValue={formField.value}
                required={formField.required}
              />
            }
          </div>
        );
      }
    );
    return fieldDiv;
  }

  async function _handleSubmit(data: any, e: any) {
    console.log("Event: ", e);
    const formData = new FormData(e.target);
    const response = await api_fetch("/auth/jwt-cookie/login", {
      credentials: "same-origin",
      method: "POST",
      body: formData,
    }).then((resp) => {
      if (resp.status == 200) {
        console.log("redirect on success");
        window.location.href = "/";
        setError(false);
      } else {
        console.warn("login failure", response);
        setError(true);
      }
    });

    return response;
  }

  return (
    <div className="flex-row">
      <div className="flex lg-margin">
        <Card className={classes.mainCard}>
          <CardContent>
            <Typography variant="subtitle1" align="center">
              {" "}
              Welcome to the Tacoma Watershed Insights Tool
            </Typography>
            <Typography variant="subtitle2" align="center">
              {" "}
              Login or Register to get Started
            </Typography>
            <Box sx={{ margin: "1em" }}>
              <form className="flex" onSubmit={handleSubmit(_handleSubmit)}>
                {_renderFormFields()}
                <div className="flex auth-form-row">
                  <a
                    className="form-label"
                    href="javascript:;"
                    onClick={() => {
                      navigate("/app/forgot-password");
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="flex-row auth-button-bar">
                  <Button
                    className={classes.mainButton}
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    Login
                  </Button>
                  <Button
                    className={classes.mainButton}
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/app/register")}
                  >
                    Register
                  </Button>
                </div>
                {error && (
                  <div className="flex auth-form-row">
                    <Typography
                      variant="caption"
                      className={classes.errorMsg}
                      align="center"
                    >
                      Incorrect username/password - please try again
                    </Typography>
                  </div>
                )}
              </form>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
