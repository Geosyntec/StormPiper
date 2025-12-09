import { useState, lazy, Suspense, useEffect } from "react";
import Box from "@mui/material/Box";

import MainBox from "./mainbox";
import Drawer from "./drawer";
import AppBar from "./appbar";
import Landing from "../landing";
import AuthChecker from "../authChecker";
const ResultsViewerPage = lazy(() => import("../results-viewer/results-page"));
const SystemExplorer = lazy(() => import("../systemExplorer"));
const Prioritization = lazy(() => import("../Prioritization"));
const EditAllUsers = lazy(() => import("../users/users-edit-all"));
const EditUser = lazy(() => import("../users/edit_user"));
const BMPDetailPage = lazy(() => import("../bmp-detail-page/bmp-detail-page"));
const ScenarioReviewPage = lazy(() =>
  import("../scenario-module/scenario-page")
);
const ScenarioDetailPage = lazy(() =>
  import("../scenario-module/scenario-detail-page")
);
const ScenarioCreatePage = lazy(() =>
  import("../scenario-module/scenario-create-page")
);
const EditGlobalSettings = lazy(() =>
  import("../global-settings/edit-settings-page")
);

function ClearDrawerButtonList({ setDrawerButtonList, closeDrawer, children }) {
  useEffect(() => {
    setDrawerButtonList([]);
    closeDrawer();
  }, []);

  return <>{children}</>;
}

export default function Dashboard({
  open,
  drawerWidth,
  viewComponent,
  toggleDrawer,
  closeDrawer,
}) {
  const [drawerButtonList, setDrawerButtonList] = useState([]);
  const [selectedDrawerButton, setSelectedDrawerButton] = useState(null);

  const hideDrawer = drawerButtonList.length === 0;

  const viewComponentRegistry = {
    prioritization: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <Prioritization setDrawerButtonList={setDrawerButtonList} />
      </AuthChecker>
    ),
    systemExplorer: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <SystemExplorer setDrawerButtonList={setDrawerButtonList} />
      </AuthChecker>
    ),
    resultsView: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ResultsViewerPage
          setDrawerButtonList={setDrawerButtonList}
          setSelectedDrawerButton={setSelectedDrawerButton}
        />
      </AuthChecker>
    ),
    editMe: <EditUser />,
    editAllUsers: (
      <AuthChecker useNav={true} allowedRoles={["user_admin", "admin"]}>
        <ClearDrawerButtonList
          setDrawerButtonList={setDrawerButtonList}
          closeDrawer={closeDrawer}
        >
          <EditAllUsers />
        </ClearDrawerButtonList>
      </AuthChecker>
    ),
    bmpDetail: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ClearDrawerButtonList
          setDrawerButtonList={setDrawerButtonList}
          closeDrawer={closeDrawer}
        >
          <BMPDetailPage />
        </ClearDrawerButtonList>
      </AuthChecker>
    ),
    scenarioDetail: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ScenarioDetailPage setDrawerButtonList={setDrawerButtonList} />
      </AuthChecker>
    ),
    scenarioReview: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ClearDrawerButtonList
          setDrawerButtonList={setDrawerButtonList}
          closeDrawer={closeDrawer}
        >
          <ScenarioReviewPage />
        </ClearDrawerButtonList>
      </AuthChecker>
    ),
    scenarioCreate: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ScenarioCreatePage setDrawerButtonList={setDrawerButtonList} />
      </AuthChecker>
    ),
    editGlobalSettings: (
      <AuthChecker useNav={true} allowedRoles={["user_admin", "admin"]}>
        <ClearDrawerButtonList
          setDrawerButtonList={setDrawerButtonList}
          closeDrawer={closeDrawer}
        >
          <EditGlobalSettings />
        </ClearDrawerButtonList>
      </AuthChecker>
    ),
    home: (
      <ClearDrawerButtonList
        setDrawerButtonList={setDrawerButtonList}
        closeDrawer={closeDrawer}
      >
        <Landing />
      </ClearDrawerButtonList>
    ),
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        hideMenu={hideDrawer}
        open={open}
        drawerWidth={drawerWidth}
        toggleDrawer={toggleDrawer}
      />
      <Drawer
        drawerButtonList={drawerButtonList}
        open={open}
        drawerWidth={drawerWidth}
        toggleDrawer={toggleDrawer}
        selectedDrawerButton={selectedDrawerButton}
        setSelectedDrawerButton={setSelectedDrawerButton}
        sx={{ display: hideDrawer && "none" }}
      />
      <MainBox open={open} drawerWidth={drawerWidth}>
        <Suspense fallback={<></>}>
          {viewComponentRegistry?.[viewComponent] || viewComponentRegistry.home}
        </Suspense>
      </MainBox>
    </Box>
  );
}
