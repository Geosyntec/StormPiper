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

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
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
        <Route path="/app/manage-users" element={<Users />}></Route>
        <Route path="/app/manage-users/:id" element={<EditUser />}></Route>
        <Route
          path="/app/prioritization/"
          element={<App viewComponent="prioritization" />}
        ></Route>
        <Route
          path="/app/prioritization/"
          element={<App viewComponent="prioritization" />}
        ></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
