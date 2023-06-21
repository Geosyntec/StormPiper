import { api_fetch, dateFormatter } from "../utils/utils";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export default function ResultRefreshBox({ refreshHandler, sx }) {
  const [isDirty, setIsDirty] = useState({
    is_dirty: false,
    last_updated: null,
  });
  const [resultsSuccessDisplay, setResultsSuccessDisplay] = useState({
    status: false,
    msg: "",
  });
  const [resultsLoadingDisplay, setResultsLoadingDisplay] = useState({
    status: false,
    msg: "",
  });
  const [resultsPollInterval, setResultsPollInterval] = useState(null);
  const [recalculationState, setRecalculationState] = useState(false);

  function _fetchIsDirty() {
    api_fetch("/api/rest/results/is_dirty")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setIsDirty(res || null);
      });
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
        refreshHandler();
      }
    }, 5000);
    setResultsPollInterval(resultsPoll);
  }

  useEffect(() => {
    //Set up is_dirty polling request to check when new results need to be calculated
    _fetchIsDirty();
    const poll = setInterval(() => _fetchIsDirty(), 10000);
    return () => clearInterval(poll);
  }, []);

  let lastUpdated = dateFormatter(isDirty.last_updated);
  let lastUpdatedStr = "";
  if (lastUpdated && lastUpdated != undefined) {
    lastUpdatedStr = lastUpdated.toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...sx,
      }}
    >
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={resultsLoadingDisplay.status}
        autoHideDuration={3000}
        onClose={() => {
          setResultsLoadingDisplay({ status: false, msg: "" });
        }}
        message={resultsLoadingDisplay.msg}
      />
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
      <Typography sx={{ width: "100%" }} variant="caption">
        Results Last Updated: {lastUpdatedStr}{" "}
      </Typography>
      <Button
        variant="contained"
        disabled={recalculationState || !isDirty?.is_dirty}
        onClick={initiateResultsSolve}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        Refresh Results
        {recalculationState && (
          <CircularProgress
            style={{ margin: "1em", alignSelf: "center", my: 0 }}
            size="1em"
          />
        )}
      </Button>
    </Box>
  );
}
