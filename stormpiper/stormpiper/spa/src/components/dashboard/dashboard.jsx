import { useState, lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Box from "@mui/material/Box";

import MainBox from "./mainbox";
import Drawer from "./drawer";
import AppBar from "./appbar";
import Landing from "../landing";
import AuthChecker from "../authChecker";

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

export default function Dashboard({
  open,
  drawerWidth,
  viewComponent,
  toggleDrawer,
  closeDrawer,
}) {
  const [drawerButtonList, setDrawerButtonList] = useState([]);
  let location = useLocation();

  useEffect(() => {
    setDrawerButtonList([]);
    closeDrawer();
  }, [location.pathname]);

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
    editMe: <EditUser />,
    editAllUsers: (
      <AuthChecker useNav={true} allowedRoles={["user_admin", "admin"]}>
        <EditAllUsers />
      </AuthChecker>
    ),
    bmpDetail: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <BMPDetailPage />
      </AuthChecker>
    ),
    scenarioDetail: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ScenarioDetailPage />
      </AuthChecker>
    ),
    scenarioReview: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ScenarioReviewPage />
      </AuthChecker>
    ),
    scenarioCreate: (
      <AuthChecker useNav={true} disallowedRoles={["public"]}>
        <ScenarioCreatePage setDrawerButtonList={setDrawerButtonList} />
      </AuthChecker>
    ),
    editGlobalSettings: (
      <AuthChecker useNav={true} allowedRoles={["user_admin", "admin"]}>
        <EditGlobalSettings />
      </AuthChecker>
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
        sx={{ display: hideDrawer && "none" }}
      />
      <MainBox open={open} drawerWidth={drawerWidth}>
        <Suspense fallback={<></>}>
          {viewComponentRegistry?.[viewComponent] || <Landing />}
        </Suspense>
      </MainBox>
    </Box>
  );
}
