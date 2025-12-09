import { useContext } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import MapIcon from "@mui/icons-material/Map";
import HubIcon from "@mui/icons-material/Hub";

import { UserProfileContext } from "./authProvider";
import { FullSpan } from "./base/two-col-grid";

import heroUrl from "../assets/img/hero-stormdrain.jpg";
import ecology_logo from "../assets/img/ecylogo-wide-color.svg";
import tacoma_logo from "../assets/img/Tacoma-Logo-3.png";
import geosyntec_logo from "../assets/img/geosyntec-logo.png";

import DocumentationURL from "../assets/docs/Tacoma_Users_Manual_Compiled.pdf";

function ActionAreaCard({ img, header, content, ...props }) {
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        height: { xs: "100%", md: 250 },
        maxWidth: { xs: "100%", md: 400 },
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
  const userProfile = useContext(UserProfileContext);

  const allowNav = userProfile?.role && userProfile.role !== "public";

  return (
    <Box
      position={"relative"}
      sx={{
        backgroundColor: (theme) => theme.palette.grey[900],
        backgroundImage: `url(${heroUrl})`,
        backgroundPosition: "center",
        backgroundPositionY: { sm: "-100px" },
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
        sx={{
          position: "absolute",
          top: "85%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <FullSpan
          sx={{
            width: { xs: "100%", md: "700px" },
            px: 2,
          }}
        >
          <Grid
            container
            rowSpacing={2}
            columnSpacing={2}
            alignItems="stretch"
            justifyContent="flex-start"
          >
            <Grid
              item
              xs={12}
              md={6}
              component={Link}
              to={allowNav && "/app/map"}
              sx={{
                textDecoration: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ActionAreaCard
                img={
                  <MapIcon
                    color="primary"
                    fontSize="large"
                    sx={{ transform: "scale(1.5)" }}
                  />
                }
                header={"Map Explorer"}
                content={`
                    Visualize the existing state of the stormwater BMP system. Search for specific facilities, and explore subbasins, pollutant heat maps, and reference imagery.
                    `}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              component={Link}
              to={allowNav && "/app/view-results"}
              sx={{
                textDecoration: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ActionAreaCard
                img={
                  <GridOnRoundedIcon
                    color="primary"
                    fontSize="large"
                    sx={{ transform: "scale(1.5)" }}
                  />
                }
                header={"WQ Results Viewer"}
                content={`
              Evaluate BMP performance, pinpoint potential retrofit
              sites, identify viable approaches to treat stormwater
              and improve Tacoma’s receiving waters.
                    `}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              component={Link}
              to={allowNav && "/app/prioritization"}
              sx={{
                textDecoration: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ActionAreaCard
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
            <Grid
              item
              xs={12}
              md={6}
              component={Link}
              to={allowNav && "/app/scenario"}
              sx={{
                textDecoration: "none",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ActionAreaCard
                img={
                  <HubIcon
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
          <Grid container sx={{ py: 2, alignItems: "center" }}>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Button
                variant="contained"
                component={Link}
                to={allowNav && DocumentationURL}
                target={allowNav ? "_blank" : "_self"}
                sx={{
                  textTransform: "none",
                  textDecoration: "none",
                }}
              >
                Technical Documentation (PDF)
              </Button>
            </Grid>
          </Grid>
          <Grid container sx={{ py: 2, alignItems: "center" }}>
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <img src={ecology_logo} height="100px" alt="Ecology Logo" />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <img src={tacoma_logo} height="80px" alt="Tacoma Logo" />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <img src={geosyntec_logo} height="100px" alt="Geosyntec Logo" />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
              width: "100%",
            }}
          >
            <Typography sx={{ color: "grey" }} variant="caption" align="center">
              Copyright © 2023 Geosyntec Consultants Inc.
            </Typography>
          </Box>
        </FullSpan>
      </Box>
    </Box>
  );
}
