import { useState, useEffect, lazy, Suspense, Fragment } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import { FullSpan, HalfSpan } from "../base/two-col-grid";
import SubbasinResultsMap from "./subbasin-results-map";
import { api_fetch } from "../../utils/utils";
import { createDisplayName } from "../../utils/utils";
import {
  result_fields_csv,
  field_manifest_csv,
  result_groups_csv,
} from "../../assets/data/csv_assets";
import ResultRefreshBox from "../resultRefreshBox";

const SubbasinResultsTable = lazy(() => import("./subbasin-results-table"));

export default function SubbasinResultsView() {
  const [visParam, setVisParam] = useState(null);
  const [resultsFields, setResultsFields] = useState(null);
  const [resultsGroups, setResultsGroups] = useState(null);
  const [subbasinAttributes, setSubbasinAttributes] = useState([]);

  function fetchSubbasinResults() {
    Promise.all(
      [result_fields_csv, field_manifest_csv, result_groups_csv].map(
        (resource) => resource
      )
    ).then((resArray) => {
      resArray[0].forEach((field) => {
        let displayName = resArray[1].filter((f) => {
          return f.field === field.field;
        })[0].display_name;
        if (displayName === "") {
          displayName = createDisplayName(field.field);
        }
        field.displayName = displayName;
      });
      setResultsFields(resArray[0]);
      setResultsGroups(resArray[2]);
    });
  }

  async function fetchSubbasinLayer() {
    const attributes = await api_fetch("/api/rest/subbasin/")
      .then((res) => res.json())
      .then((res) => {
        return Object.keys(res[0]);
      })
      .catch((err) => console.warn("Couldn't get results", err));
    setSubbasinAttributes(attributes);
  }

  useEffect(() => {
    fetchSubbasinLayer();
    fetchSubbasinResults();
  }, []);

  return (
    <>
      <HalfSpan md={4}>
        <Card
          sx={{
            width: "100%",
            height: "500px",
            position: "relative",
            padding: 2,
          }}
        >
          <Typography sx={{ my: 2 }} variant="h6">
            Subbasin Water Quality Results
          </Typography>
          <Typography sx={{ my: 2 }} variant="body1">
            Select attributes below to visualize results across all subbasins.{" "}
            <br />
            <br />
            View and download all subbasin data in the table below.
          </Typography>
          <Typography sx={{ my: 3 }} variant="body1"></Typography>
          <TextField
            sx={{ minWidth: "85%" }}
            key="vis-param-picker"
            variant="filled"
            label="Subbasin Parameter to Visualize"
            select
            value={visParam || ""}
            onChange={(e) => {
              setVisParam(e.target.value);
            }}
          >
            <ListSubheader key="default">Pick a Field</ListSubheader>
            {resultsGroups &&
              resultsGroups.map((group) => {
                let groupFields = resultsFields
                  .filter((field) => field.group === group.group)
                  .map((field) => {
                    return (
                      <MenuItem
                        key={field.field}
                        value={field.field}
                        disabled={!subbasinAttributes.includes(field.field)}
                        sx={{ overflow: "hidden" }}
                      >
                        {field.displayName}
                      </MenuItem>
                    );
                  });
                let subHeader = (
                  <ListSubheader key={group.group}>
                    {group.display_name}
                  </ListSubheader>
                );
                return [subHeader, ...groupFields];
              })}
          </TextField>
          <ResultRefreshBox
            refreshHandler={fetchSubbasinResults}
            sx={{
              my: 2,
              alignItems: "start",
            }}
          />
        </Card>
      </HalfSpan>
      <HalfSpan md={8}>
        <Card
          sx={{
            width: "100%",
            height: "500px",
            position: "relative",
          }}
        >
          <SubbasinResultsMap visParam={visParam} />
        </Card>
      </HalfSpan>
      <FullSpan>
        <Card
          sx={{
            display: "flex",
            height: "100%",
            width: "100%",
            alignItems: "start",
            justifyContent: "center",
            p: { xs: 2 },
          }}
        >
          <Suspense fallback={<Box>Loading Table...</Box>}>
            <SubbasinResultsTable
              fieldList={resultsFields}
            ></SubbasinResultsTable>
          </Suspense>
        </Card>
      </FullSpan>
    </>
  );
}
