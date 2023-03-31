import { useState, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import AuthProvider from "./components/authProvider";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import ScatterPlotRoundedIcon from "@mui/icons-material/ScatterPlotRounded";
import { Box } from "@mui/material";
import { themeOptions } from "./theme";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import Dashboard from "./components/dashboard";

const Landing = lazy(() => import("./components/landing"));
const SystemExplorer = lazy(() => import("./components/systemExplorer"));
const Prioritization = lazy(() => import("./components/Prioritization"));
const EditAllUsers = lazy(() => import("./components/users/users-edit-all"));
const EditUser = lazy(() => import("./components/users/edit_user"));
const BMPDetailPage = lazy(() =>
  import("./components/bmp-detail-page/bmp-detail-page")
);
const ScenarioReviewPage = lazy(() =>
  import("./components/scenario-module/scenario-page")
);
const ScenarioDetailPage = lazy(() =>
  import("./components/scenario-module/scenario-detail-page")
);
const ScenarioCreatePage = lazy(() =>
  import("./components/scenario-module/scenario-create-page")
);

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

  const viewComponent = (
    <Suspense fallback={<>...</>}>{_getViewComponent()}</Suspense>
  );

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
