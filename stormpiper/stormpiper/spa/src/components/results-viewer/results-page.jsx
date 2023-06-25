import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import { api_fetch } from "../../utils/utils";
import SubbasinResultsView from "./subbasin-result-view";
import ActionAreaCard from "../base/action-area-card";

const FacilityResultsTable = lazy(() => import("./facility-results-table"));

export default function ResultsViewerPage({
  setDrawerButtonList,
  setSelectedDrawerButton,
}) {
  const navigate = useNavigate();
  const [showFacilityResults, setShowFacilityResults] = useState(false);
  const [showSubbasinResults, setShowSubbasinResults] = useState(false);

  const buttonList = [
    {
      label: "About",
      icon: <InfoRoundedIcon />,
      clickHandler: () => {
        setShowFacilityResults(false);
        setShowSubbasinResults(false);
      },
    },
    {
      label: "View All Facility Results",
      icon: <ScatterPlotIcon />,
      clickHandler: toggleFacilityView,
    },
    {
      label: "View All Subbasin Results",
      icon: <DashboardOutlinedIcon />,
      clickHandler: toggleSubbasinView,
    },
  ];

  useEffect(() => {
    setDrawerButtonList(buttonList);
    setSelectedDrawerButton("About");
  }, []);

  function toggleFacilityView() {
    setShowFacilityResults(true);
    setShowSubbasinResults(false);
    setSelectedDrawerButton("View All Facility Results");
  }

  function toggleSubbasinView() {
    setShowFacilityResults(false);
    setShowSubbasinResults(true);
    setSelectedDrawerButton("View All Subbasin Results");
  }

  return (
    <TwoColGrid>
      {showFacilityResults && (
        <FullSpan>
          <Card
            sx={{
              display: "flex",
              height: "100%",
              minHeight: "600px",
              width: "100%",
              alignItems: "start",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Suspense fallback={<Box>Loading Table...</Box>}>
              <FacilityResultsTable nodes="all"></FacilityResultsTable>
            </Suspense>
          </Card>
        </FullSpan>
      )}
      {showSubbasinResults && <SubbasinResultsView />}
      {!showSubbasinResults && !showFacilityResults && (
        <FullSpan md={12}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "auto",
              width: "100%",
              justifyContent: "center",
              alignItems: "flex-start",
              p: { xs: 2 },
            }}
          >
            <CardContent>
              <Box sx={{ mt: 2, mb: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography align="left" variant="h5">
                    <strong>Water Quality Results Viewer</strong>
                  </Typography>
                </Box>
                <Typography align="left" variant="body2">
                  This module provides a comprehensive summary of the water
                  quality performance of existing Tacoma BMP's, and the
                  conditions of each stormwater subbasin.
                </Typography>
              </Box>
              <Box>
                <Grid container rowSpacing={2} columnSpacing={2}>
                  <Grid item xs={12} md={6}>
                    <ActionAreaCard
                      img={
                        <ScatterPlotIcon
                          color="primary"
                          fontSize="large"
                          sx={{ transform: "scale(1.5)" }}
                        />
                      }
                      header="BMP Facility Results View"
                      content="Explore BMP results across four climate epochs"
                      onClick={toggleFacilityView}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ActionAreaCard
                      img={
                        <DashboardOutlinedIcon
                          color="primary"
                          fontSize="large"
                          sx={{ transform: "scale(1.5)" }}
                        />
                      }
                      header="Subbasins Results View"
                      content="Explore stormwater subbasin results. Results only available for the 1980's climate epoch"
                      onClick={toggleSubbasinView}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </FullSpan>
      )}
    </TwoColGrid>
  );
}
