import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

const MainBoxStyled = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})(({ theme, open, drawerWidth }) => ({
  transition: theme.transitions.create(
    ["width", "margin-left", "margin-right"],
    {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }
  ),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(
      ["width", "margin-left", "margin-right"],
      {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }
    ),
  }),
}));

export default function MainBox({ children, ...props }) {
  return (
    <MainBoxStyled
      component="main"
      id="main"
      sx={{
        flexGrow: 1,
        mt: { xs: 6, sm: 8 },
        minHeight: "calc(100vh - 66px)",
        maxWidth: "calc(100vw - (100vw - 100%))",
      }}
      {...props}
    >
      {children}
    </MainBoxStyled>
  );
}
