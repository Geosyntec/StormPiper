import { useState, lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Box from "@mui/material/Box";

import MainBox from "./mainbox";
import Drawer from "./drawer";
import AppBar from "./appbar";
import Landing from "../landing";

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
      <Prioritization setDrawerButtonList={setDrawerButtonList} />
    ),
    systemExplorer: (
      <SystemExplorer setDrawerButtonList={setDrawerButtonList} />
    ),
    editMe: <EditUser />,
    editAllUsers: <EditAllUsers />,
    bmpDetail: <BMPDetailPage />,
    scenarioDetail: <ScenarioDetailPage />,
    scenarioReview: <ScenarioReviewPage />,
    scenarioCreate: (
      <ScenarioCreatePage setDrawerButtonList={setDrawerButtonList} />
    ),
    editGlobalSettings: <EditGlobalSettings />,
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
