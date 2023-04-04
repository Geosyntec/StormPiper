import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

const MainBoxStyled = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})(({ theme, open, drawerWidth }) => ({
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: (theme) =>
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[900],
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function MainBox(props) {
  const theme = useTheme();

  return (
    <MainBoxStyled
      component="main"
      id="main"
      open={props.open}
      drawerWidth={props.drawerWidth}
      sx={{
        flexGrow: 1,
        mt: 8,
        backgroundColor: theme.palette.grey[50],
        minHeight: "calc(100vh - 66px)",
      }}
    >
      {props?.children}
    </MainBoxStyled>
  );
}
