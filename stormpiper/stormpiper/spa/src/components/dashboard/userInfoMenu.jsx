import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, ListItem, Box, Divider, Tooltip } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuList from "@mui/material/MenuList";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupIcon from "@mui/icons-material/Group";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SettingsIcon from "@mui/icons-material/Settings";
import { UserProfileContext } from "../authProvider";

import { api_fetch } from "../../utils/utils";
import AuthChecker from "../authChecker";

export default function UserInfo({ ...props }) {
  const userProfile = useContext(UserProfileContext);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(false);

  const navigate = useNavigate();

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
      <Tooltip title="Profile">
        <IconButton
          size="large"
          ref={anchorRef}
          id="profile-button"
          aria-controls={open ? "profile-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
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
                  id="profile-menu"
                  aria-labelledby="profile-button"
                  onKeyDown={handleListKeyDown}
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
                  <MenuItem
                    component={Link}
                    to={"/app/manage-users/me"}
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <AccountBoxIcon />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <AuthChecker allowedRoles={["admin", "user_admin"]}>
                    {[
                      <MenuItem
                        component={Link}
                        to={"/app/manage-users"}
                        key={"manage-users"}
                        onClick={handleClose}
                      >
                        <ListItemIcon>
                          <GroupIcon />
                        </ListItemIcon>
                        Manage Users
                      </MenuItem>,
                      <MenuItem
                        key={"settings"}
                        component={Link}
                        to={"/app/settings"}
                        onClick={handleClose}
                      >
                        <ListItemIcon>
                          <SettingsIcon />
                        </ListItemIcon>
                        Settings
                      </MenuItem>,
                    ]}
                  </AuthChecker>
                  <MenuItem
                    onClick={() => {
                      _postLogout();
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
