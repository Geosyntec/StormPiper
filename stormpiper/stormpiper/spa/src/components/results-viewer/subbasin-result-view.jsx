import { useState, useEffect, lazy, Suspense, Fragment } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  ListSubheader,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { FullSpan, HalfSpan } from "../base/two-col-grid";
import SubbasinResultsMap from "./subbasin-results-map";
import { csv } from "d3-fetch";
import { api_fetch } from "../../utils/utils";
import { createDisplayName } from "../../utils/utils";

const SubbasinResultsTable = lazy(() => import("./subbasin-results-table"));

export default function SubbasinResultsView() {
  const [visParam, setVisParam] = useState(null);
  const [resultsFields, setResultsFields] = useState(null);
  const [resultsGroups, setResultsGroups] = useState(null);
  const [subbasinAttributes, setSubbasinAttributes] = useState([]);

  useEffect(async () => {
    const attributes = await api_fetch("/api/rest/subbasin/")
      .then((res) => res.json())
      .then((res) => {
        return Object.keys(res[0]);
      })
      .catch((err) => console.warn("Couldn't get results", err));
    setSubbasinAttributes(attributes);
  }, []);

  useEffect(() => {
    Promise.all(
      [
        "../../assets/data/result_fields.csv",
        "../../assets/data/field_manifest.csv",
      ].map((url) => csv(url))
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
    });
    csv("../../assets/data/result_groups.csv").then((res) =>
      setResultsGroups(res)
    );
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
            <SubbasinResultsTable></SubbasinResultsTable>
          </Suspense>
        </Card>
      </FullSpan>
    </>
  );
}
