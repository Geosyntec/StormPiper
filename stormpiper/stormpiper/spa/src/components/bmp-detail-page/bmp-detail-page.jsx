import { Box, Card, Button, Snackbar } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { BMPDetailResults } from "./bmp-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import BMPDetailMap from "./bmp-detail-map";
import { BMPDetailForm } from "./bmp-detail-form";
import { api_fetch } from "../../utils/utils";
import { zoomToFeature } from "../../utils/map_utils";
import ResultRefreshBox from "../resultRefreshBox";

async function getFacility(id) {
  console.log("Looking for: ", id);
  const response = await api_fetch(
    `/api/rest/tmnt_facility/?f=geojson&node_id=${id}`
  );
  const data = await response.json();
  const facility = data?.features?.find((feature) => {
    return feature.properties.altid === id;
  });
  return facility;
}
async function getDelineation(id) {
  console.log("Looking for delineation: ", id);
  const response = await api_fetch(
    `/api/rest/tmnt_delineation?f=geojson&relid=${id}`
  );
  const data = await response.json();
  const delineation = data?.features?.find((feature) => {
    return feature.properties.relid === id;
  });
  console.log("Found delineation: ", delineation, data, delineation?.bbox);

  return delineation;
}

export default function BMPDetailPage() {
  const params = useParams();
  const [zoomFeature, setZoomFeature] = useState(null);
  const [facility, setFacility] = useState(null);
  const [bmpResults, setBMPResults] = useState(null);
  const [delineation, setDelineation] = useState(null);
  const [viewState, setViewState] = useState(null);
  const [resultsPollInterval, setResultsPollInterval] = useState(null);
  const [resultsSuccessDisplay, setResultsSuccessDisplay] = useState({
    status: false,
    msg: "",
  });
  const [resultsLoadingDisplay, setResultsLoadingDisplay] = useState({
    status: false,
    msg: "",
  });
  const [recalculationState, setRecalculationState] = useState(false);

  async function getResultsDataByID() {
    const res_response = await api_fetch(
      `/api/rest/results/${params.id}?epoch=all`
    );
    if (res_response.status <= 400) {
      const res = await res_response.json();
      setBMPResults(res);
    }
  }

  async function initiateResultsSolve() {
    setResultsLoadingDisplay({
      status: true,
      msg: "Refreshing Results",
    });
    setRecalculationState(true);

    const taskID = await api_fetch("/api/rpc/solve_watershed")
      .then((res) => res.json())
      .then((res) => {
        if (!["STARTED", "SUCCESS"].includes(res.status)) {
          throw new Error("Scenario will not solve");
        }
        return res.task_id;
      });
    const resultsPoll = setInterval(async () => {
      const taskResult = await api_fetch(`/api/rest/tasks/${taskID}`)
        .then((res) => res.json())
        .then((res) => {
          return res.status;
        });
      if (taskResult === "SUCCESS") {
        setResultsSuccessDisplay({ status: true, msg: "Results Calculated" });
        setRecalculationState(false);
        getResultsDataByID();
      }
    }, 5000);
    setResultsPollInterval(resultsPoll);
  }

  useEffect(async () => {
    getResultsDataByID();
    setTimeout(async () => {
      const facility_res = await getFacility(params.id);
      facility_res && setFacility(facility_res);

      const delin_res = await getDelineation(params.id);
      delin_res && setDelineation(delin_res);

      const _zoomFeature = delin_res || facility_res || null;
      setZoomFeature(_zoomFeature);
      setViewState(
        zoomToFeature({
          feature: _zoomFeature,
          transitionInterpolator: null,
          transitionDuration: 0,
        })
      );
    }, 200);
  }, [params.id]);

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={resultsSuccessDisplay.status}
        autoHideDuration={3000}
        onClose={() => {
          setResultsSuccessDisplay({ status: false, msg: "" });
          clearInterval(resultsPollInterval);
          setResultsPollInterval(null);
        }}
        message={resultsSuccessDisplay.msg}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={resultsLoadingDisplay.status}
        autoHideDuration={3000}
        onClose={() => {
          setResultsLoadingDisplay({ status: false, msg: "" });
        }}
        message={resultsLoadingDisplay.msg}
      />
      <TwoColGrid>
        <HalfSpan>
          <Card sx={{ display: "flex", p: 3, height: "100%" }}>
            <Box sx={{ width: "100%" }}>
              <BMPDetailForm calculateHandler={initiateResultsSolve} />
            </Box>
          </Card>
        </HalfSpan>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              minHeight: 500,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BMPDetailMap
              facility={facility}
              delineation={delineation}
              viewState={viewState}
            />
          </Card>
        </HalfSpan>
        <HalfSpan>
          <Box
            sx={{
              pb: 3,
            }}
          >
            <Card sx={{ padding: 2 }}>
              <ResultRefreshBox
                refreshHandler={initiateResultsSolve}
                recalculationState={recalculationState}
              />
            </Card>
          </Box>
        </HalfSpan>
        <FullSpan>
          <BMPDetailResults data={bmpResults} />
        </FullSpan>
      </TwoColGrid>
    </>
  );
}
