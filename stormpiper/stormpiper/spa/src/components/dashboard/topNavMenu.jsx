import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { Button, Typography } from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuList from "@mui/material/MenuList";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import MapIcon from "@mui/icons-material/Map";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HubIcon from "@mui/icons-material/Hub";

const topNavItems = [
  {
    label: "Prioritize Watersheds",
    link: "/app/prioritization",
    icon: <CompareArrowsIcon sx={{ transform: "rotate(90deg)" }} />,
  },
  {
    label: "Map Explorer",
    link: "/app/map",
    icon: <MapIcon />,
  },
  {
    label: "Scenario Designer",
    link: "/app/scenario",
    icon: <HubIcon />,
  },
  // fallback is last
  {
    label: "Home",
    link: "/app",
    icon: <HomeRoundedIcon />,
  },
];

const getTopNavItemIndexFromRoute = () => {
  const route = window.location.pathname;
  const ix = topNavItems.findIndex((opt) => route.includes(opt.link));
  return ix;
};

export default function TopNavMenu(props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);
  const [selectedIndex, setSelectedIndex] = useState(0);
  let location = useLocation();

  useEffect(() => {
    const ix = getTopNavItemIndexFromRoute();
    setSelectedIndex(ix);
  }, [location]);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Box {...props}>
      <Tooltip title="Navigate">
        <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="inherit"
          sx={{ borderRadius: 2, ml: 3, textTransform: "none" }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {topNavItems[selectedIndex].label}
          </Typography>
          <KeyboardArrowDownIcon />
        </Button>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "right top",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  {topNavItems.map((option, index) => (
                    <MenuItem
                      component={Link}
                      to={option.link}
                      key={option.label}
                      selected={index === selectedIndex}
                      onClick={handleClose}
                    >
                      {option?.icon && (
                        <ListItemIcon>{option.icon}</ListItemIcon>
                      )}
                      <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
