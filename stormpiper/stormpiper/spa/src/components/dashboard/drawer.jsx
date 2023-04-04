import { useState } from "react";
import { styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import WorkflowModal from "../workflowModal";

const DrawerStyled = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})(({ theme, open, drawerWidth }) => ({
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

export default function Drawer(props) {
  const [selectedButton, setSelectedButton] = useState("");
  const buttons = props.drawerButtonList;
  return (
    <DrawerStyled
      variant="permanent"
      open={props.open}
      drawerWidth={props.drawerWidth}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        <IconButton onClick={props.toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <List>
        {buttons.map((button) => {
          return (
            <ListItem
              key={button.label}
              sx={{
                justifyContent: props.open ? "flex-start" : "center",
              }}
            >
              <WorkflowModal
                workflowTitle={button.label}
                iconComponent={button.icon}
                displayTitle={props.open}
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
    </DrawerStyled>
  );
}
