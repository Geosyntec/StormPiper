import {
  Chip,
  ListItem,
  CircularProgress,
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { numFormatter, pctFormatter } from "../../utils/utils";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";

import { api_fetch } from "../../utils/utils";
import {
  result_fields_csv,
  result_groups_csv,
} from "../../assets/data/csv_assets";

type TableHeader = {
  field: string;
  headerName: string;
  valueFormatter: (values: any) => any;
  headerAlign: string;
  align: string;
  type: string;
  width?: number;
};

type FieldGroup = {
  groupName: string;
  fields: string[];
};

type FacilityResultsTableState = {
  results: [];
  headers: TableHeader[];
  loaded: Boolean;
};

export default function SubbasinResultsTable({ fieldList }) {
  let allResults: any;
  let resSpec: any;
  let headers: TableHeader[];

  const firstRender = useRef(true);
  const [resultState, setResultState] = useState<FacilityResultsTableState>({
    results: [],
    headers: [],
    loaded: false,
  });

  const [resultsFields, setResultsFields] = useState([]);
  const [resultsGroups, setResultsGroups] = useState([]);
  const [fieldGroups, setFieldGroups] = useState([]);
  const pinnedFields = ["basinname", "subbasin", "epoch"];

  const [currentEpoch, setCurrentEpoch] = useState("1980s");
  const [currentFields, setCurrentFields] = useState(fieldGroups[0]?.fields);
  const [currentGroup, setCurrentGroup] = useState(fieldGroups[0]?.groupName);

  useEffect(() => {
    let resources = [];
    if (
      [
        "Land Use Breakdown",
        "Land Cover Breakdown",
        "Treatment Facility Summary",
      ].includes(currentGroup)
    ) {
      resources = [
        { resource: "/openapi.json", format: "json" },
        {
          resource: `/api/rest/subbasin/`,
          format: "json",
        },
        { resource: result_fields_csv, format: "csv" },
        { resource: result_groups_csv, format: "csv" },
      ];
    } else {
      resources = [
        { resource: "/openapi.json", format: "json" },
        {
          resource: `/api/rest/subbasin/wq/?epoch=${currentEpoch}`,
          format: "json",
        },
        { resource: result_fields_csv, format: "csv" },
        { resource: result_groups_csv, format: "csv" },
      ];
    }
    if (fieldList) {
      //guard against render cycles where field list is not set
      Promise.all(
        resources.map(({ resource, format }) => {
          if (format === "json") {
            return api_fetch(resource).then((res) => res.json());
          } else {
            return resource;
          }
        })
      )
        .then((resArray) => {
          resSpec = resArray[0].components.schemas.SubbasinInfoView;
          allResults = resArray[1];
          headers = _buildTableColumns(resSpec.properties, fieldList);
          setResultState({
            results: allResults,
            headers,
            loaded: true,
          });

          setResultsFields(resArray[2]);
          setResultsGroups(resArray[3]);
          let fieldGroups = resArray[3].map((group) => {
            return {
              groupName: group.display_name,
              fields: [
                ...pinnedFields,
                ...resArray[2]
                  .filter((field) => field.group === group.group)
                  .map((group) => group.field),
              ],
            };
          });

          //initialize table on first render
          if (firstRender.current) {
            setFieldGroups(fieldGroups);
            setCurrentFields(fieldGroups[0]?.fields);
            setCurrentGroup(fieldGroups[0]?.groupName);
            firstRender.current = false;
          }
        })
        .catch((err) => console.warn("Couldn't get results", err));
    }
  }, [fieldList, currentEpoch, currentGroup]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "flex-start",
            width: "100%",
            mx: 3,
            my: 2,
          }}
        >
          <GridToolbarExport
            csvOptions={{
              allColumns: true,
              fileName: () => {
                "Tacoma_Watersheds_Subbasin_" +
                  currentGroup.replaceAll(" ", "_");
              },
            }}
            printOptions={{ disableToolbarButton: true }}
            sx={{ mx: 2 }}
          />
          <TextField
            sx={{ minWidth: "125px", mx: 5, alignSelf: "center" }}
            variant="outlined"
            label="Climate Epoch"
            select
            value={
              [
                "Land Use Breakdown",
                "Land Cover Breakdown",
                "Treatment Facility Summary",
              ].includes(currentGroup)
                ? "1980s"
                : currentEpoch
            }
            onChange={(e) => {
              setCurrentEpoch(e.target.value);
            }}
            size="small"
            disabled={[
              "Land Use Breakdown",
              "Land Cover Breakdown",
              "Treatment Facility Summary",
            ].includes(currentGroup)}
          >
            {["all", "1980s", "2030s", "2050s", "2080s"].map((epoch) => {
              return (
                <MenuItem key={`epoch-${epoch}`} value={epoch}>
                  {epoch}
                </MenuItem>
              );
            })}
          </TextField>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "flex-start",
              flexWrap: "wrap",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
            component="ul"
          >
            {fieldGroups.map((group) => {
              return (
                <ListItem
                  key={group.groupName}
                  sx={{ width: "auto", padding: 0 }}
                >
                  <Chip
                    sx={{
                      margin: (theme) => theme.spacing(0.5),
                      backgroundColor: (theme) =>
                        group.groupName === currentGroup
                          ? theme.palette.success.main
                          : theme.palette.grey[100],
                      "&:hover": {
                        //'disable' hover color by setting it to the same as non-hover color
                        backgroundColor: (theme) =>
                          group.groupName === currentGroup
                            ? theme.palette.success.main
                            : theme.palette.grey[100],
                      },
                    }}
                    label={group.groupName}
                    onClick={() => {
                      setCurrentFields(group.fields);
                      setCurrentGroup(group.groupName);
                    }}
                  />
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </GridToolbarContainer>
    );
  }

  function getValueFormatter(fieldName: string, type: string) {
    let valueFormatter;
    valueFormatter =
      fieldName.toLowerCase().indexOf("pct") > 0 ? pctFormatter : numFormatter;
    if (type === "string") {
      valueFormatter = null;
    }
    return valueFormatter;
  }

  function _buildTableColumns(
    props: {
      [key: string]: { title: string; type: string };
    },
    resultFields: { group: string; field: string; displayName: string }[]
  ): TableHeader[] {
    let colArr: TableHeader[] = [];
    Object.keys(props).map((k) => {
      if (resultFields) {
        colArr.push({
          field: k,
          headerName:
            resultFields.filter((field) => field.field === k)[0]?.displayName ||
            props[k].title, //props[k].title,
          width: 150, //pinnedFields.includes(k) ? 100 : 100 + (props[k].title.length - 20),
          headerAlign: "center",
          align: "center",
          valueFormatter: getValueFormatter(k, props[k].type),
          type: props[k].type,
        });
      }
    });
    return colArr;
  }

  function getCurrentColumns(
    allColumns: TableHeader[],
    columnsToDisplay: string[]
  ) {
    let res = [];
    if (!columnsToDisplay) {
      return res;
    }
    columnsToDisplay.map((column) => {
      let fieldToAdd = allColumns.filter((header: TableHeader) => {
        return header.field === column;
      });
      if (fieldToAdd.length > 0) {
        res.push(fieldToAdd[0]);
      }
    });
    return res;
  }

  if (resultState.loaded) {
    console.log("Active Group: ", currentGroup);
    return (
      <Box
        sx={{
          maxHeight: 1000,
          height: 500,
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
          overflow: "scroll",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "95%",
            width: "100%",
            flexGrow: 1,
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", margin: 1 }}>
            <Box
              sx={{
                position: "absolute",
                justifyContent: "end",
                right: "2%",
                top: "0%",
              }}
            ></Box>
          </Box>
          <DataGrid
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                textOverflow: "clip",
                whiteSpace: "break-spaces",
                lineHeight: "1.35rem",
              },
            }}
            rows={resultState.results}
            columnHeaderHeight={100}
            columns={getCurrentColumns(resultState.headers, currentFields)}
            rowsPerPageOptions={[5, 25, 100]}
            disableSelectionOnClick
            getRowId={(row) => row["node_id"] + row["epoch"]}
            density={"compact"}
            slots={{ toolbar: CustomToolbar }}
          />
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5">Loading results...</Typography>
        <CircularProgress style={{ margin: "1em", alignSelf: "center" }} />
      </Box>
    );
  }
}
