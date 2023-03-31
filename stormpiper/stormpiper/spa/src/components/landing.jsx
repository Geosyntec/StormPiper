import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { default as SimpleCardForm } from "./forms/simpleCardForm";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <SimpleCardForm>
      <Typography variant="subtitle1" align="center">
        Welcome to the Tacoma Watershed Insights Tool
      </Typography>
      <Box sx={{ margin: "1em" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button
            sx={{ margin: "1rem" }}
            variant="contained"
            color="primary"
            onClick={() => navigate("/app/map")}
          >
            View Existing System
          </Button>
          <Button
            sx={{ margin: "1rem" }}
            variant="contained"
            color="primary"
            onClick={() => navigate("/app/prioritization")}
          >
            Prioritize Watersheds
          </Button>
        </Box>
      </Box>
    </SimpleCardForm>
  );
}
