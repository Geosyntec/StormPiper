import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";

import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useNavigate } from "react-router-dom";
import { ListItem, Button } from "@mui/material";
import WorkflowModal from "./workflowModal";

import { api_fetch } from "../utils/utils";

const useStyles = {
  centeredMenuItem: {
    justifyContent: "center",
  },
  alignStartMenuItem: {
    justifyContent: "flex-start",
  },
};

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.palette.primary.main,
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(8),
      },
    }),
  },
}));

const MainBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: (theme) =>
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[900],
  ...(open && {
    // marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function Dashboard(props) {
  const classes = useStyles;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const [selectedButton, setSelectedButton] = useState("");

  const [userProfile, setUserProfile] = useState({
    firstName: "User",
    email: "email@tacoma.watersheds.com",
    id: "",
    role: "",
  });

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
          setUserProfile({
            firstName: res.first_name,
            userEmail: res.email,
            id: res.id,
            role: res.role,
          });
        }
      });
  }, []);

  function _postLogout() {
    api_fetch("/auth/jwt-cookie/logout", {
      method: "POST",
    });
    navigate("/app/login");
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Tacoma Watershed Insights
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <DrawerHeader sx={{ minHeight: 0 }}>
          <List>
            {open ? (
              <React.Fragment>
                <ListItem>
                  <Typography variant="subtitle1">
                    Hello {userProfile.firstName}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography variant="subtitle2">
                    {userProfile.userEmail}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/app/manage-users/me")}
                  >
                    Manage My Profile
                  </Button>
                </ListItem>
                {["admin", "user_admin"].includes(userProfile.role) && (
                  <ListItem>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/app/manage-users")}
                    >
                      Manage All Users
                    </Button>
                  </ListItem>
                )}
                <ListItem>
                  <Button variant="contained" onClick={_postLogout}>
                    Logout
                  </Button>
                </ListItem>
              </React.Fragment>
            ) : (
              <p></p>
            )}
          </List>
        </DrawerHeader>
        <List>
          {Object.keys(props.buttons).map((b) => {
            const button = props.buttons[b];
            return (
              <ListItem
                sx={
                  open ? classes.alignStartMenuItem : classes.centeredMenuItem
                }
              >
                <WorkflowModal
                  workflowTitle={button.label}
                  iconComponent={button.icon}
                  displayTitle={open}
                  clickHandler={() => {
                    console.log("button clicked: ", button);
                    setSelectedButton(button.label);
                    if (button.clickHandler) {
                      button.clickHandler();
                    }
                  }}
                  selected={selectedButton}
                ></WorkflowModal>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <MainBox
        component="main"
        id="main"
        open={open}
        sx={{
          flexGrow: 1,
          mt: 8,
        }}
      >
        {/* <Container disableGutters> */}
        {props?.viewComponent}
        {/* </Container> */}
      </MainBox>
    </Box>
  );
}
