import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007cc2ff", //star-command-blue
      warning: "#f19a3eff", //deep-saffron
      success: "#57a773ff", //forest-green-crayola
      contrastText: "#fff",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
});

export function themeOptions(open, drawerWidth) {
  return {
    palette: {
      primary: { main: "#007cc2ff" }, // --star-command-blue: #007cc2ff;
      secondary: { main: "#f19a3eff" }, // --deep-saffron: #f19a3eff;
      success: { main: "#57a773ff" }, // --forest-green-crayola: #57a773ff;
      info: { main: "#4c5760ff" }, // --black-coral: #4c5760ff;
      // add a new color
      neutral: { main: "#eff9f0ff" }, // --mint-cream: #eff9f0ff;
    },
    breakpoints: open
      ? {
          values: {
            xs: 0,
            sm: 600 + drawerWidth,
            md: 900 + drawerWidth,
            lg: 1200 + drawerWidth,
            xl: 1536 + drawerWidth,
          },
        }
      : {},
  };
}
