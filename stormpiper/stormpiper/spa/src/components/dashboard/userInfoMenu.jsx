import { useState } from "react";

import {
  Button,
  List,
  ListItem,
  Box,
  Divider,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";

import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { api_fetch } from "../../utils/utils";

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupIcon from "@mui/icons-material/Group";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

export default function UserInfo({ userProfile, ...props }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  async function _postLogout() {
    await api_fetch("/auth/jwt-cookie/logout", {
      method: "POST",
    });

    await api_fetch("/auth/jwt-bearer/logout", {
      method: "POST",
    });

    navigate("/app/login");
  }

  return (
    <Box {...props}>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <ListItem>
          <Typography variant="subtitle1">
            {userProfile.first_name} {userProfile.last_name}
          </Typography>
        </ListItem>
        <ListItem>
          {userProfile.email}&nbsp;
          {userProfile.is_verified ? (
            <Tooltip title={"verified"}>
              <CheckIcon color="success" />
            </Tooltip>
          ) : (
            <Tooltip title={"not verified"}>
              <CloseIcon color="error" />
            </Tooltip>
          )}
        </ListItem>
        {!userProfile.is_verified && (
          <ListItem>
            <Button
              disabled={verifyButtonDisabled}
              variant="contained"
              onClick={() => {
                api_fetch("/auth/request-verify-token", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email: userProfile.email }),
                });
                setVerifyButtonDisabled(true);
              }}
            >
              Click to Verify
            </Button>
          </ListItem>
        )}
        <Divider sx={{ my: 3 }} />
        <MenuItem onClick={() => navigate("/app/manage-users/me")}>
          <ListItemIcon>
            <AccountBoxIcon />
          </ListItemIcon>
          Edit Profile
        </MenuItem>
        {["admin", "user_admin"].includes(userProfile.role) && (
          <MenuItem onClick={() => navigate("/app/manage-users")}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            Manage All Profiles
          </MenuItem>
        )}
        <MenuItem onClick={_postLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
