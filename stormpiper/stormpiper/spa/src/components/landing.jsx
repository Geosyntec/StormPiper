import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import MapIcon from "@mui/icons-material/Map";
import TuneIcon from "@mui/icons-material/Tune";

import { UserProfileContext } from "./authProvider";

import heroUrl from "../assets/img/hero-stormdrain.jpg";

function ActionAreaCard({ img, header, content, ...props }) {
  return (
    <Card
      sx={{
        display: "flex-start",
        alignItems: "stretch",
        height: "100%",
        maxWidth: { xs: "100%", md: 345 },
      }}
      {...props}
    >
      <CardActionArea>
        <CardContent>
          <Box
            sx={{
              display: { xs: "flex", md: "block" },
              alignItems: { md: "center" },
              verticalAlign: "center",
            }}
          >
            <Box
              sx={{
                py: { xs: 0, md: 3 },
                pr: { xs: 2, md: 0 },
                display: { xs: "inline-block", md: "flex" },
                justifyContent: { xs: "left", md: "center" },
              }}
            >
              {img}
            </Box>
            <Box>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                color="primary"
              >
                {header}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const userProfile = useContext(UserProfileContext);

  const allowNav = userProfile?.role && userProfile.role !== "public";

  return (
    <Box
      position={"relative"}
      sx={{
        backgroundColor: (theme) => theme.palette.grey[900],
        backgroundImage: `url(${heroUrl})`,
        backgroundPosition: "center",
        backgroundPositionY: "-100px",
        alignSelf: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box py={15}>
        <Typography
          variant="h2"
          color="white"
          textAlign="center"
          fontWeight="bold"
        >
          Tacoma Watershed Insights
        </Typography>
        <Typography variant="h4" color="white" textAlign="center" mt={5}>
          Plan stormwater solutions for a cleaner, healthier Tacoma
        </Typography>
      </Box>

      <Box
        position={"absolute"}
        sx={{
          width: "90%",
          top: "85%",
          left: "5%",
        }}
      >
        <Grid
          container
          rowSpacing={6}
          columnSpacing={6}
          alignItems="stretch"
          justifyContent="center"
        >
          <Grid item xs={12} md={4}>
            <ActionAreaCard
              onClick={() => allowNav && navigate("/app/map")}
              img={
                <MapIcon
                  color="primary"
                  fontSize="large"
                  sx={{ transform: "scale(1.5)" }}
                />
              }
              header={"Map Explorer"}
              content={`
                    Evaluate BMP performance, pinpoint potential retrofit
                    sites and, identify viable approaches to treat stormwater
                    and improve Tacoma’s receiving waters.
                    `}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ActionAreaCard
              onClick={() => allowNav && navigate("/app/prioritization")}
              img={
                <CompareArrowsIcon
                  fontSize="large"
                  color="primary"
                  sx={{
                    transform: "rotate(90deg) scale(1.5)",
                  }}
                />
              }
              header={"Decision Support"}
              content={`
                  Prioritize investments and allocate resources more effectively
                  through an understanding of life-cycle costs and project benefits.
                  `}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ActionAreaCard
              onClick={() => allowNav && navigate("/app/scenario")}
              img={
                <TuneIcon
                  fontSize="large"
                  color="primary"
                  sx={{
                    transform: "scale(1.5)",
                  }}
                />
              }
              header={"Scenario Builder"}
              content={`
                  Ensure decisions help improve watershed conditions for all
                  community members. Help promote equitable and sustainable
                  outcomes in stormwater project and enhance neighborhoods for everybody.

                    `}
            />
          </Grid>
        </Grid>
        <Box height="150px" />
      </Box>
    </Box>
  );
}
