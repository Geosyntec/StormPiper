import { ListAltRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api_fetch } from "../utils/utils";
import { BMPForm } from "./bmpForm";

// TODO: Make Facility Type editable (for now, only allow user to toggle between simple and not simple). Look for endpoint that can retrieve all facility types, and their respective data models

const statsDict = {
  overview: {
    label: "Overview",
    fields: ["altid", "facilitytype"],
  },
  designParameters: {
    label: "Design Parameters",
    fields: [
      "design_storm_depth_inches",
      "total_volume_cuft",
      "retention_volume_cuft",
    ],
  },
  performanceSummary: {
    label: "Performance Summary",
    fields: [
      "runoff_volume_cuft_inflow",
      "runoff_volume_cuft_treated",
      "runoff_volume_cuft_retained",
      "runoff_volume_cuft_captured",
      "runoff_volume_cuft_bypassed",
    ],
  },
};

const fieldLabelDict: { [key: string]: string } = {
  altid: "ID",
  facilitytype: "Facility Type",
  design_storm_depth_inches: "Design Storm Depth (in)",
  tributary_area_tc_min: "Tributary Area Tc (min)",
  total_volume_cuft: "Total Volume (cubic ft)",
  retention_volume_cuft: "Retention Volume (cubic ft)",
  runoff_volume_cuft_inflow: "Inflow Runoff (cubic ft)",
  runoff_volume_cuft_retained: "Retained Runoff (cubic ft)",
  runoff_volume_cuft_treated: "Treated Runoff (cubic ft)",
  runoff_volume_cuft_captured: "Captured Runoff (cubic ft)",
  runoff_volume_cuft_bypassed: "Bypassed Runoff (cubic ft)",
};

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
  items: any;
  results: { [k: string]: string | number | undefined }[];
};

type specState = {
  context: any;
  facilitySpec: any;
};

function BMPStatWindow(props: statWindowProps) {
  let firstRender = useRef(true);

  const [state, setState] = useState<bmpPanelState>({
    header: null,
    stats: [],
    error: false,
    isLoaded: false,
    items: [],
    results: [],
  });

  const [facilityType, setFacilityType] = useState("");

  const [specs, setSpecs] = useState<specState>({
    context: {},
    facilitySpec: {},
  });

  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [recalculationState, setRecalculationState] = useState<boolean>(false);

  useEffect(() => {
    // OpenAPI spec holds the base facility types used by nereid
    // Context endpoint holds mapping between project-specific names and base types
    let resources = ["/openapi.json", "/api/rest/reference/context"];

    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    ).then((resArray) => {
      setSpecs({
        facilitySpec: resArray[0].components.schemas,
        context: resArray[1].api_recognize.treatment_facility.facility_type,
      });
    });
  }, []);

  useEffect(() => {
    if (!props?.isDirty?.is_dirty) {
      setRecalculationState(false);
    }
  }, [props?.isDirty]);

  useEffect(() => {
    if (!props?.feature) return;
    console.log("Fetching tmnt attributes");
    let tmnt_results = [
      "/api/rest/results/" + props.feature,
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
          items: {
            ...resArray[1], //response from api/rest/tmnt_facility
          },
          results: {
            ...resArray[0][1], //response from api/rest/results
          },
          stats: firstRender.current ? statsDict.overview.fields : state.stats,
        });
        setFacilityType(resArray[1].facility_type);
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
  }, [props?.feature, recalculationState, facilityType]);

  function switchStats(headerName: string) {
    setState(() => {
      let stats: any[] = [];
      let results: any[] = [];

      const fields: string[] | undefined = Object.values(statsDict)
        .filter((group) => group.label === headerName)
        .map((f) => f.fields)[0];
      if (state.items && fields) {
        stats = Object.keys(state.items).filter((item: string) => {
          return fields.includes(item);
        });
        results = Object.keys(state.results).filter((item: string) => {
          return fields.includes(item);
        });
        stats.push(...results);
      }
      return {
        ...state,
        header: headerName,
        stats: stats,
      };
    });
  }
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
    let lastUpdated: Date = new Date(props.isDirty?.last_updated);
    let lastUpdatedStr: string;
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
      let statsList = Object.values(state.stats).map(
        (stat: string, i: number) => {
          if (stat) {
            let renderedStat = state.items[stat] || state.results[stat];
            if (typeof renderedStat === "number") {
              renderedStat = new Intl.NumberFormat("en-US", {
                maximumSignificantDigits: 6,
              }).format(renderedStat);
            }
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  py: 1,
                }}
              >
                <strong>{fieldLabelDict[stat]}:&#8195;</strong>
                {renderedStat}
              </Box>
            );
          }
        }
      );
      return (
        <>
          {_renderUpdateBox()}
          <Box>
            {statsList.length > 0 ? (
              statsList
            ) : (
              <Typography variant="h6">
                <strong>Data Unavailable</strong>
              </Typography>
            )}
          </Box>
        </>
      );
    }
  }

  function _renderBMPForm(facilityType: string) {
    if (state.error) {
      return <Box>Something went wrong on our end.</Box>;
    } else if (!loadingState) {
      return <Box>Loading...</Box>;
    } else {
      let fType: string = facilityType;
      let fTypeRoot = fType.replace("_simple", "");

      let simpleBaseType;
      if (fTypeRoot === "no_treatment") {
        simpleBaseType = specs.context[fTypeRoot].validator; //no_treatment has no simple equivalent
      } else {
        simpleBaseType = specs.context[fTypeRoot + "_simple"].validator;
      }
      let baseType = specs.context[fTypeRoot].validator;

      let facilityFields = specs.facilitySpec[baseType];
      let simpleFacilityFields = specs.facilitySpec[simpleBaseType];
      return (
        <>
          {_renderUpdateBox()}
          <BMPForm
            allFields={facilityFields}
            simpleFields={simpleFacilityFields}
            values={state.items}
            allFacilities={specs.context}
            currentFacility={facilityType}
            facilityChangeHandler={setFacilityType}
            context="existing-system"
          ></BMPForm>
        </>
      );
    }
  }

  function _renderHeaderList() {
    return (
      <ul
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {Object.values(statsDict).map((category, index) => {
          return (
            <li>
              <Chip
                sx={{
                  margin: (theme) => theme.spacing(0.5),
                  backgroundColor: (theme) =>
                    category.label === state.header
                      ? theme.palette.warning.main
                      : theme.palette.grey[100],
                }}
                label={category.label}
                onClick={() => {
                  switchStats(category.label);
                }}
              />
            </li>
          );
        })}
      </ul>
    );
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
          <Box>
            {props
              ? state.header != "Design Parameters"
                ? _renderStats()
                : _renderBMPForm(facilityType)
              : null}
          </Box>
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

export default BMPStatWindow;
