import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

import TopNavMenu from "./topNavMenu";
import UserInfo from "./userInfoMenu";

const AppBarStyled = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})(({ theme, open, drawerWidth }) => ({
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

export default function AppBar({
  open,
  drawerWidth,
  toggleDrawer,
  userProfile,
  hideMenu,
}) {
  const navigate = useNavigate();

  const isUserLoggedIn = !!userProfile?.role;
  const showNav = isUserLoggedIn && userProfile?.role !== "public";

  return (
    <AppBarStyled position="absolute" open={open} drawerWidth={drawerWidth}>
      <Toolbar
        sx={{
          pr: "24px", // keep right padding when drawer closed
        }}
      >
        <Tooltip title="Expand">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
              ...(hideMenu && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Button sx={{ textTransform: "none" }} color="inherit">
          <Tooltip title="Home">
            <Typography
              component="h1"
              variant="h6"
              noWrap
              sx={{ fontWeight: "bold" }}
              onClick={() => navigate("/app")}
            >
              Tacoma Watershed Insights
            </Typography>
          </Tooltip>
        </Button>

        {showNav ? <TopNavMenu sx={{ mt: 0.5 }} /> : <></>}
        <Box sx={{ flexGrow: 1 }} />
        {isUserLoggedIn ? (
          <UserInfo userProfile={userProfile} />
        ) : (
          <Tooltip title="Login">
            <Button
              sx={{ color: "white" }}
              onClick={() => navigate("/app/login")}
            >
              <AccountCircle />
              &nbsp;Log in
            </Button>
          </Tooltip>
        )}
      </Toolbar>
    </AppBarStyled>
  );
}
