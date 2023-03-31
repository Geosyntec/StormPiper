import { StrictMode, Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

const Login = lazy(() => import("./components/login"));
const Reset = lazy(() => import("./components/reset"));
const Register = lazy(() => import("./components/register"));
const Verify = lazy(() => import("./components/verify"));
const Forgot = lazy(() => import("./components/forgot"));
const App = lazy(() => import("./App"));

function Sus({ children }) {
  return <Suspense fallback={<>...</>}>{children}</Suspense>;
}

function SusApp({ viewComponent }) {
  return (
    <Sus>
      <App viewComponent={viewComponent} />
    </Sus>
  );
}

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<SusApp viewComponent="landing" />}></Route>
        <Route
          path="/app/"
          element={<SusApp viewComponent="landing" />}
        ></Route>
        <Route
          path="/app/login/"
          element={
            <Sus>
              <Login />
            </Sus>
          }
        ></Route>
        <Route
          path="/app/register/"
          element={
            <Sus>
              <Register />
            </Sus>
          }
        ></Route>
        <Route
          path="/app/verify/"
          element={
            <Sus>
              <Verify />
            </Sus>
          }
        ></Route>
        <Route
          path="/app/reset/"
          element={
            <Sus>
              <Reset />
            </Sus>
          }
        ></Route>
        <Route
          path="/app/forgot-password/"
          element={
            <Sus>
              <Forgot />
            </Sus>
          }
        ></Route>
        <Route
          path="/app/map/"
          element={<SusApp viewComponent="systemExplorer" />}
        >
          <Route
            path="tmnt"
            element={<SusApp viewComponent="systemExplorer" />}
          >
            <Route
              path=":id"
              element={<SusApp viewComponent="systemExplorer" />}
            ></Route>
          </Route>
        </Route>
        <Route
          path="/app/manage-users"
          element={<SusApp viewComponent="editAllUsers" />}
        ></Route>
        <Route
          path="/app/manage-users/:id"
          element={<SusApp viewComponent="editMe" />}
        ></Route>
        <Route
          path="/app/prioritization/"
          element={<SusApp viewComponent="prioritization" />}
        ></Route>
        <Route
          path="/app/bmp-detail/:id"
          element={<SusApp viewComponent="bmpDetail" />}
        ></Route>
        <Route
          path="/app/scenario"
          element={<SusApp viewComponent="scenarioReview" />}
        ></Route>
        <Route
          path="/app/create-scenario"
          element={<SusApp viewComponent="scenarioCreate" />}
        ></Route>
        <Route
          path="/app/scenario/:id"
          element={<SusApp viewComponent="scenarioDetail" />}
        ></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById("root")
);
