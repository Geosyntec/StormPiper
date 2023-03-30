import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AuthProvider from "./components/authProvider";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import InfoRoundedIcon from "@material-ui/icons/InfoRounded";
import GridOnRoundedIcon from "@material-ui/icons/GridOnRounded";
import ScatterPlotRoundedIcon from "@material-ui/icons/ScatterPlotRounded";
import { Box } from "@mui/material";
import SystemExplorer from "./components/systemExplorer";
import Prioritization from "./components/Prioritization";
import Landing from "./components/landing";
import { themeOptions } from "./theme";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";
import Dashboard from "./components/dashboard";
import { EditAllUsers, EditUser } from "./components/users";
import { BMPDetailPage } from "./components/bmp-detail-page";
import {
  ScenarioReviewPage,
  ScenarioDetailPage,
  ScenarioCreatePage,
} from "./components/scenario-module";

function App(props) {
  const [open, setOpen] = useState(false);
  const drawerWidth = 240;

  const toggleDrawer = () => setOpen(!open);

  const theme = useMemo(
    () => createTheme(themeOptions(open, drawerWidth)),
    [open]
  );

  let navigate = useNavigate();

  const [resultsDisplayState, setResultsDisplayState] = useState(false); //when true, results table is displayed
  const [priorityWorkflowState, setPriorityWorkflowState] = useState("scoring");

  function _toggleSetResultsDisplayState() {
    setResultsDisplayState(!resultsDisplayState);
  }

  function _getViewComponent() {
    switch (props.viewComponent) {
      case "systemExplorer":
        return (
          <SystemExplorer
            resultsDisplayState={resultsDisplayState}
            resultsDisplayController={_toggleSetResultsDisplayState}
          />
        );
      case "prioritization":
        return <Prioritization workflowState={priorityWorkflowState} />;
      case "editMe":
        return <EditUser />;
      case "editAllUsers":
        return <EditAllUsers />;
      case "bmpDetail":
        return <BMPDetailPage />;
      case "scenarioDetail":
        return <ScenarioDetailPage />;
      case "scenarioReview":
        return <ScenarioReviewPage />;
      case "scenarioCreate":
        return <ScenarioCreatePage />;
      default:
        return <Landing />;
    }
  }

  const topMenuButtons = {
    default: {
      home: {
        label: "Home",
        icon: <HomeRoundedIcon />,
        clickHandler: () => navigate("/app"),
      },
    },
    landing: {},
    systemExplorer: {
      home: {
        label: "Home",
        icon: <HomeRoundedIcon />,
        clickHandler: () => navigate("/app"),
      },
      project: {
        label: "Evaluate Project",
        icon: <GridOnRoundedIcon />,
        clickHandler: _toggleSetResultsDisplayState,
      },
      watershed: {
        label: "Prioritize Watersheds",
        icon: <ScatterPlotRoundedIcon />,
        clickHandler: () => navigate("/app/prioritization"),
      },
    },
    prioritization: {
      home: {
        label: "Home",
        icon: <HomeRoundedIcon />,
        clickHandler: () => navigate("/app"),
      },
      about: {
        label: "About Prioritization",
        icon: <InfoRoundedIcon />,
        clickHandler: () => setPriorityWorkflowState("info"),
      },

      project: {
        label: "Define Criteria Weights",
        icon: <GridOnRoundedIcon />,
        clickHandler: () => setPriorityWorkflowState("scoring"),
      },
    },
  };

  const viewComponent = _getViewComponent();

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Box className="App">
          <Dashboard
            toggleDrawer={toggleDrawer}
            open={open}
            drawerWidth={drawerWidth}
            buttons={
              topMenuButtons[props.viewComponent] ?? topMenuButtons.default
            }
            viewComponent={viewComponent}
          />
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
