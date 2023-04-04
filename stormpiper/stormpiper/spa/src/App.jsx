import { useState, useMemo } from "react";

import { Box } from "@mui/material";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material";

import AuthProvider from "./components/authProvider";
import Dashboard from "./components/dashboard/dashboard";
import { themeOptions } from "./theme";

function App({ viewComponent }) {
  const [open, setOpen] = useState(false);
  const drawerWidth = 240;

  const toggleOpen = () => setOpen(!open);

  const theme = useMemo(
    () => createTheme(themeOptions(open, drawerWidth)),
    [open]
  );

  return (
    <Box className="App">
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Dashboard
            toggleDrawer={toggleOpen}
            open={open}
            drawerWidth={drawerWidth}
            viewComponent={viewComponent}
          />
        </AuthProvider>
      </ThemeProvider>
    </Box>
  );
}

export default App;
