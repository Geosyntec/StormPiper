import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { api_fetch, dateFormatter } from "../utils/utils";
import { BMPReadOnlyInfo } from "./bmp-detail-page/bmp-basic-info";

type statWindowProps = {
  displayStatus: boolean;
  displayController: () => void;
  feature: string;
  isDirty: { is_dirty: boolean; last_updated: Date };
  lastUpdated: boolean;
};

type bmpPanelState = {
  header: string | null;
  stats: string[];
  error: boolean;
  isLoaded: boolean;
  bmp_data: object;
  results: { [k: string]: string | number | undefined }[];
};

export default function BMPInfoWindow(props: statWindowProps) {
  let firstRender = useRef(true);

  const [state, setState] = useState<bmpPanelState>({
    header: null,
    stats: [],
    error: false,
    isLoaded: false,
    bmp_data: {},
    results: [],
  });
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [recalculationState, setRecalculationState] = useState<boolean>(false);

  useEffect(() => {
    if (!props?.isDirty?.is_dirty) {
      setRecalculationState(false);
    }
  }, [props?.isDirty]);

  useEffect(() => {
    if (!props?.feature) return;
    console.log("Fetching tmnt attributes");
    let tmnt_results = [
      // "/api/rest/results/" + props.feature,
      "/api/rest/tmnt_facility/" + props.feature,
    ];

    setLoadingState(false);
    Promise.all(
      tmnt_results.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        console.log("Fetched all resources; ", resArray);
        //TODO: Can we set the header based on RecalculationState? If true, then set to Performance Summary, else Overview
        setState({
          ...state,
          error: false,
          header: firstRender.current ? "Overview" : state.header,
          bmp_data: { ...resArray[0] }, //response from api/rest/tmnt_facility
        });
        setLoadingState(true);
        firstRender.current = false;
      })
      .catch((err) => {
        console.log("TMNT fetch failed: ", err);
        setState({
          ...state,
          error: true,
        });
      });
  }, [props?.feature, recalculationState]);

  function _recalculate() {
    setRecalculationState(true);
    api_fetch("/api/rpc/solve_watershed")
      .then((resp) => {
        return resp.json();
      })
      .then((resp) => {
        console.log("Recalculation started: ", resp);
      })
      .catch((err) => {
        console.log("Recalculate Failed: ", err);
      });
  }

  function _renderUpdateBox() {
    let lastUpdated: Date = dateFormatter(props.isDirty?.last_updated);
    let lastUpdatedStr: string = "";
    if (lastUpdated && lastUpdated != undefined) {
      lastUpdatedStr = lastUpdated.toLocaleString("en-US", {
        dateStyle: "short",
        timeStyle: "short",
      });
    }
    return (
      <Box>
        {props?.isDirty ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption">
              Results Last Updated: {lastUpdatedStr}{" "}
              {props?.isDirty?.is_dirty && (
                <a
                  href={props?.isDirty?.is_dirty ? "#" : undefined}
                  onClick={_recalculate}
                  style={{ cursor: "pointer" }}
                >
                  Refresh
                </a>
              )}
            </Typography>
            {recalculationState && (
              <CircularProgress
                style={{ margin: "1em", alignSelf: "center" }}
                size="1em"
              />
            )}
          </Box>
        ) : (
          <Box></Box>
        )}
      </Box>
    );
  }

  function _renderStats() {
    if (!props.feature) {
      return <Paper>Select a BMP Feature</Paper>;
    }
    if (state.error) {
      return <Box>Something went wrong on our end.</Box>;
    } else if (!loadingState) {
      return <Box>Loading...</Box>;
    } else {
      return (
        <>
          {_renderUpdateBox()}
          <BMPReadOnlyInfo data={state.bmp_data} />
        </>
      );
    }
  }

  return (
    <>
      {props.displayStatus && (
        <Box sx={{ p: 1 }}>
          <Box
            sx={{
              background: (theme) => theme.palette.primary.main,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "5px",
              px: 2,
            }}
          >
            <Box>
              <h4 style={{ color: "white" }}>
                {props.feature} Facility Overview
              </h4>
            </Box>
            <Box sx={{ cursor: "pointer" }}>
              <Typography
                variant="h6"
                onClick={() => {
                  props.displayController();
                  firstRender.current = true;
                }}
              >
                &#10005;
              </Typography>
            </Box>
          </Box>
          <Box>{_renderStats()}</Box>
          <Box sx={{ display: "flex", pt: 1 }}>
            <Button
              component={Link}
              to={"/app/bmp-detail/" + props.feature}
              variant="contained"
            >
              View Facility Details
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
