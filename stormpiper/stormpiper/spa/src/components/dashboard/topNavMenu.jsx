import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
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
    link: "/app/create-scenario",
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  let location = useLocation();

  useEffect(() => {
    const ix = getTopNavItemIndexFromRoute();
    setSelectedIndex(ix);
  }, [location]);

  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
    navigate(topNavItems[index].link);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box {...props}>
      <List component="nav" aria-label="Top Nav">
        <Tooltip title="Navigate">
          <ListItemButton
            sx={{ borderRadius: 2, mx: 3 }}
            id="nav-button"
            aria-haspopup="listbox"
            aria-controls="nav-menu"
            aria-label="top nav options"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClickListItem}
          >
            <ListItemText
              primary={topNavItems[selectedIndex].label}
              primaryTypographyProps={{
                variant: "subtitle2",
                style: {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
            <KeyboardArrowDownIcon />
          </ListItemButton>
        </Tooltip>
      </List>
      <Menu
        id="nav-menu"
        keepMounted
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "nav-button",
          role: "listbox",
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {topNavItems.map((option, index) => (
          <MenuItem
            key={option.label}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option?.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
