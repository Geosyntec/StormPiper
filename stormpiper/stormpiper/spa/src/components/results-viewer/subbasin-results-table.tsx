import { Chip, Button, CircularProgress, Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { numFormatter, pctFormatter } from "../../utils/utils";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";

import { api_fetch } from "../../utils/utils";
import { csv } from "d3-fetch";

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

export default function SubbasinResultsTable() {
  let allResults: any;
  let resSpec: any;
  let headers: TableHeader[];

  const [resultState, setResultState] = useState<FacilityResultsTableState>({
    results: [],
    headers: [],
    loaded: false,
  });

  const [resultsFields, setResultsFields] = useState([]);
  const [resultsGroups, setResultsGroups] = useState([]);
  const [fieldGroups, setFieldGroups] = useState([]);
  const pinnedFields = ["basinname", "subbasin"];
  // const fieldGroups: FieldGroup[] =
  //   resultsGroups &&
  //   resultsGroups.map((group) => {
  //     return {
  //       groupName: group.display_name,
  //       fields: [
  //         ...pinnedFields,
  //         ...resultsFields
  //           .filter((field) => field.group === group.group)
  //           .map((group) => group.field),
  //       ],
  //     };
  //   });

  const [currentFields, setCurrentFields] = useState(fieldGroups[0]?.fields);
  const [currentGroup, setCurrentGroup] = useState(fieldGroups[0]?.groupName);

  useEffect(() => {
    let resources = ["/openapi.json", "/api/rest/subbasin/wq/"];
    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        resSpec = resArray[0].components.schemas.SubbasinInfoView;
        allResults = resArray[1];
        headers = _buildTableColumns(resSpec.properties);
        setResultState({
          results: allResults,
          headers,
          loaded: true,
        });
      })
      .catch((err) => console.warn("Couldn't get results", err));
  }, []);

  useEffect(() => {
    Promise.all(
      [
        "../../assets/data/result_fields.csv",
        "../../assets/data/result_groups.csv",
      ].map((url) => csv(url))
    ).then((resArray) => {
      setResultsFields(resArray[0]);
      setResultsGroups(resArray[1]);
      let fieldGroups = resArray[1].map((group) => {
        return {
          groupName: group.display_name,
          fields: [
            ...pinnedFields,
            ...resArray[0]
              .filter((field) => field.group === group.group)
              .map((group) => group.field),
          ],
        };
      });
      setFieldGroups(fieldGroups);
      setCurrentFields(fieldGroups[0]?.fields);
      setCurrentGroup(fieldGroups[0]?.groupName);
    });
  }, []);

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
          <GridToolbarExport sx={{ mx: 2 }} />
          <ul
            style={{
              display: "flex",
              alignContent: "end",
              flexWrap: "wrap",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {fieldGroups.map((group) => {
              return (
                <li key={group.groupName}>
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
                </li>
              );
            })}
          </ul>
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

  function _buildTableColumns(props: {
    [key: string]: { title: string; type: string };
  }): TableHeader[] {
    let colArr: TableHeader[] = [];
    Object.keys(props).map((k) => {
      colArr.push({
        field: k,
        headerName: props[k].title,
        width: 150, //pinnedFields.includes(k) ? 100 : 100 + (props[k].title.length - 20),
        headerAlign: "center",
        align: "center",
        valueFormatter: getValueFormatter(k, props[k].type),
        type: props[k].type,
      });
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
          minHeight: 500,
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
            slotProps={{
              toolbar: {
                csvOptions: { allColumns: true },
                printOptions: { disableToolbarButton: true },
              },
            }}
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