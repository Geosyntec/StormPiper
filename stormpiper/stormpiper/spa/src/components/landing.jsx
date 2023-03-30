import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { default as SimpleCardForm } from "./forms/simpleCardForm";

const LandingButton = (props) => {
  return (
    <Button
      sx={{ margin: "1rem" }}
      variant="contained"
      color="primary"
      {...props}
    >
      {props.children}
    </Button>
  );
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <SimpleCardForm>
      <Typography variant="subtitle1" align="center">
        Welcome to the Tacoma Watershed Insights Tool
      </Typography>
      <Box sx={{ margin: "1em" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <LandingButton onClick={() => navigate("/app/map")}>
            View Existing System
          </LandingButton>
          <LandingButton onClick={() => navigate("/app/prioritization")}>
            Prioritize Watersheds
          </LandingButton>
        </Box>
      </Box>
    </SimpleCardForm>
  );
}
