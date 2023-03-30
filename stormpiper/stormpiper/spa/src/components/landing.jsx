import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";

const LandingButton = (props) => {
  return (
    <Button
      color="primary"
      sx={{ padding: 1, margin: 1 }}
      variant="contained"
      {...props}
    >
      {props.children}
    </Button>
  );
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ height: 300 }}>
        <CardContent>
          <Typography variant="h5" align="center">
            Welcome to the Tacoma Watershed Insights Tool
          </Typography>
          <Box mt={8} align="center">
            <LandingButton onClick={() => navigate("/app/login")}>
              Login
            </LandingButton>
            <LandingButton onClick={() => navigate("/app/register")}>
              Register
            </LandingButton>
            <LandingButton onClick={() => navigate("/app/map")}>
              View Existing System
            </LandingButton>
            <LandingButton onClick={() => navigate("/app/prioritization")}>
              Prioritize Watersheds
            </LandingButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
