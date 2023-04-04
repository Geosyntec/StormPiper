import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

import { api_fetch } from "../../utils/utils";
import MainBox from "./mainbox";
import Drawer from "./drawer";
import AppBar from "./appbar";

const defaultUserProfile = {
  first_name: "User",
  email: "email@tacoma.watersheds.com",
  id: "",
  role: "",
};

export default function Dashboard({ viewComponent, ...props }) {
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const hideDrawer = userProfile.role === "public" || !userProfile.role;

  useEffect(() => {
    api_fetch("/api/rest/users/me")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.detail === "Unauthorized") {
          //pass
        } else {
          console.log("Found user info:", res);
          setUserProfile({ ...res });
        }
      });
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar hideMenu={hideDrawer} userProfile={userProfile} {...props} />
      {!hideDrawer && (
        <Drawer buttons={props.buttons} userProfile={userProfile} {...props} />
      )}
      <MainBox userProfile={userProfile} {...props}>
        {viewComponent}
      </MainBox>
    </Box>
  );
}
