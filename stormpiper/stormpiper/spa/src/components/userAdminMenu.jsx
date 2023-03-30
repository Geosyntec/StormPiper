import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ExitToApp from "@mui/icons-material/ExitToApp";

export default function UserAdminMenu() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {/* <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        Open Menu
      </Button> */}

      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={handleClick}
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Typography variant="body1">Hello, Guest</Typography>
        <MenuItem disabled onClick={handleClose}>
          <AccountBoxIcon />
          Update User Profile
        </MenuItem>
        <MenuItem disabled onClick={handleClose}>
          <ExitToApp />
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}
