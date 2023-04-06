import { useState, lazy, Suspense, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

import Box from "@mui/material/Box";

import MainBox from "./mainbox";
import Drawer from "./drawer";
import AppBar from "./appbar";
import Landing from "../landing";
import { UserProfileContext } from "../authProvider";

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

export default function Dashboard({
  open,
  drawerWidth,
  viewComponent,
  toggleDrawer,
}) {
  const userProfile = useContext(UserProfileContext);
  const [drawerButtonList, setDrawerButtonList] = useState([]);
  let location = useLocation();

  useEffect(() => {
    setDrawerButtonList([]);
  }, [location]);

  const hideDrawer =
    userProfile.role === "public" ||
    !userProfile.role ||
    drawerButtonList.length === 0;

  function _getViewComponent(viewComponent) {
    switch (viewComponent) {
      case "systemExplorer":
        return (
          <SystemExplorer
            setDrawerButtonList={setDrawerButtonList}
            userProfile={userProfile}
          />
        );
      case "prioritization":
        return <Prioritization setDrawerButtonList={setDrawerButtonList} />;
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
        return <ScenarioCreatePage setDrawerButtonList={setDrawerButtonList} />;
      default:
        return <Landing />;
    }
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        hideMenu={hideDrawer}
        userProfile={userProfile}
        open={open}
        drawerWidth={drawerWidth}
        toggleDrawer={toggleDrawer}
      />
      {!hideDrawer && (
        <Drawer
          drawerButtonList={drawerButtonList}
          userProfile={userProfile}
          open={open}
          drawerWidth={drawerWidth}
          toggleDrawer={toggleDrawer}
        />
      )}
      <MainBox
        viewComponent={viewComponent}
        setDrawerButtonList={setDrawerButtonList}
        userProfile={userProfile}
      >
        <Suspense fallback={<>...</>}>
          {_getViewComponent(viewComponent)}
        </Suspense>
      </MainBox>
    </Box>
  );
}
