import { api_fetch, dateFormatter } from "../utils/utils";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function ResultRefreshBox({
  refreshHandler,
  recalculationState,
}) {
  const [isDirty, setIsDirty] = useState({
    is_dirty: false,
    last_updated: null,
  });

  function _fetchIsDirty() {
    api_fetch("/api/rest/results/is_dirty")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setIsDirty(res || null);
      });
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
      }}
    >
      <Typography variant="caption">
        Results Last Updated: {lastUpdatedStr}{" "}
      </Typography>
      <Button
        variant="contained"
        disabled={recalculationState || !isDirty?.is_dirty}
        onClick={refreshHandler}
        sx={{ width: "100%" }}
      >
        Refresh Results
        {recalculationState && (
          <CircularProgress
            style={{ margin: "1em", alignSelf: "center" }}
            size="1em"
          />
        )}
      </Button>
    </Box>
  );
}
