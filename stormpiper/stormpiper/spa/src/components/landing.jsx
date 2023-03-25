import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./login.css"
import {
  Box,
  Card,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Button } from "@material-ui/core";

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

export default function Landing() {
  const navigate = useNavigate();
  const classes = useStyles();

  return (
    <div className="flex-row">
      <div className="flex lg-margin">
        <Card className={classes.mainCard}>
          <CardContent>
            <Typography variant="subtitle1" align="center">
              {" "}
              Welcome to the Tacoma Watershed Insights Tool
            </Typography>
            <Box sx={{ margin: "1em" }}>
              <div className="flex-row auth-button-bar">
                <Button
                  className={classes.mainButton}
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/app/login")}
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
                <Button
                  className={classes.mainButton}
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/app/map")}
                >
                  View Existing System
                </Button>
                <Button
                  className={classes.mainButton}
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/app/prioritization")}
                >
                  Prioritize Watersheds
                </Button>
              </div>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
