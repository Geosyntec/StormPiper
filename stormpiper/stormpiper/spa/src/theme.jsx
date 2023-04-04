import { createTheme } from "@mui/material/styles";
import { ThemeProvider as ThemeProviderMUI, CssBaseline } from "@mui/material";

// https://mui.com/material-ui/customization/default-theme/

export function themeOptions(open, drawerWidth) {
  return {
    palette: {
      primary: { main: "#007cc2ff" }, // --star-command-blue: #007cc2ff;
      secondary: { main: "#f19a3eff" }, // --deep-saffron: #f19a3eff;
      success: { main: "#57a773ff" }, // --forest-green-crayola: #57a773ff;
      info: { main: "#4c5760ff" }, // --black-coral: #4c5760ff;
      // add a new color
      neutral: { main: "#eff9f0ff" }, // --mint-cream: #eff9f0ff;
      background: {
        default: "#f5f5f5", // #f5f5f5 === theme.palette.grey[100]
      },
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

export const staticTheme = createTheme(themeOptions());

export function ThemeProvider({ theme, children }) {
  return (
    <ThemeProviderMUI theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProviderMUI>
  );
}
