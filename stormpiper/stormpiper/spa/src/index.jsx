import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Login from "./components/login"
import Register from "./components/register"
import Verify from "./components/verify";
// import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app/" element={<App/>}></Route>
        <Route path="/app/login/" element={<Login/>}></Route>
        <Route path="/app/register/" element={<Register/>}></Route>
        <Route path="/app/verify/" element={<Verify/>}></Route>
        <Route path="/app/map/" element={<App/>}>
          <Route path="tmnt" element={<App/>}>
            <Route path=":id" element = {<App/>}></Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
