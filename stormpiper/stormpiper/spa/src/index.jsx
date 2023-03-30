import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Login from "./components/login";
import Reset from "./components/reset";
import Register from "./components/register";
import { Users, EditUser } from "./components/users";
import Verify from "./components/verify";
import Forgot from "./components/forgot";
import Dashboard from "./components/dashboard";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "./theme";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/app/login/"
          element={
            <ThemeProvider theme={theme}>
              <Login />
            </ThemeProvider>
          }
        ></Route>
        <Route
          path="/app/register/"
          element={
            <ThemeProvider theme={theme}>
              <Register />
            </ThemeProvider>
          }
        ></Route>
        <Route
          path="/app/verify/"
          element={
            <ThemeProvider theme={theme}>
              <Verify />
            </ThemeProvider>
          }
        ></Route>
        <Route
          path="/app/reset/"
          element={
            <ThemeProvider theme={theme}>
              <Reset />
            </ThemeProvider>
          }
        ></Route>
        <Route
          path="/app/forgot-password/"
          element={
            <ThemeProvider theme={theme}>
              <Forgot />
            </ThemeProvider>
          }
        ></Route>
        <Route path="/app/" element={<App viewComponent="landing" />}></Route>
        <Route
          path="/app/map/"
          element={<App viewComponent="systemExplorer" />}
        >
          <Route path="tmnt" element={<App viewComponent="systemExplorer" />}>
            <Route
              path=":id"
              element={<App viewComponent="systemExplorer" />}
            ></Route>
          </Route>
        </Route>
        <Route
          path="/app/manage-users"
          element={<App viewComponent="editAllUsers" />}
        ></Route>
        <Route
          path="/app/manage-users/:id"
          element={<App viewComponent="editMe" />}
        ></Route>
        <Route
          path="/app/prioritization/"
          element={<App viewComponent="prioritization" />}
        ></Route>
        <Route
          path="/app/bmp-detail/:id"
          element={<App viewComponent="bmpDetail" />}
        ></Route>
        <Route
          path="/app/scenario"
          element={<App viewComponent="scenarioReview" />}
        ></Route>
        <Route
          path="/app/create-scenario"
          element={<App viewComponent="scenarioCreate" />}
        ></Route>
        <Route
          path="/app/scenario/:id"
          element={<App viewComponent="scenarioDetail" />}
        ></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
