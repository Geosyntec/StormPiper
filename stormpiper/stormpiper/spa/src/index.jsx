import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./components/login";
import Reset from "./components/reset";
import Register from "./components/register";
import Verify from "./components/verify";
import Forgot from "./components/forgot";
import App from "./App";

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<App viewComponent="landing" />}></Route>
        <Route path="/app/" element={<App viewComponent="landing" />}></Route>
        <Route path="/app/login/" element={<Login />}></Route>
        <Route path="/app/register/" element={<Register />}></Route>
        <Route path="/app/verify/" element={<Verify />}></Route>
        <Route path="/app/reset/" element={<Reset />}></Route>
        <Route path="/app/forgot-password/" element={<Forgot />}></Route>
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
        <Route
          path="/app/settings"
          element={<App viewComponent="editGlobalSettings" />}
        ></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById("root")
);
