import {
  Chip,
  CircularProgress,
  Box,
  Typography,
  TextField,
  MenuItem,
  ListItem,
  Paper,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Link } from "react-router-dom";

import { numFormatter, pctFormatter, strFormatter } from "../../utils/utils";

import { api_fetch } from "../../utils/utils";
import ResultRefreshBox from "../resultRefreshBox";

type TableHeader = {
  field: string;
  headerName: string;
  valueFormatter: (values: any) => any;
  // flex?:number,
  headerAlign: string;
  align: string;
  type: string;
  width?: number;
  renderCell?: Function;
};

type FieldGroup = {
  groupName: string;
  fields: string[];
};

type FacilityResultsTableProps = {
  nodes?: "all" | string;
};

type FacilityResultsTableState = {
  results: [];
  headers: TableHeader[];
  loaded: Boolean;
};

function convertToCSV(
  objArray: { [k: string]: string | number | undefined }[]
) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  return str;
}

function exportCSVFile(items: any, fileTitle: string, headers: any) {
  let headersFormatted: { [k: string]: string } = {};

  Object.keys(headers).map((k) => {
    headersFormatted[k] = headers[k].field;
  });

  // if (headers) {
  items.unshift(headersFormatted);
  // }

  // Convert Object to JSON
  // var jsonObject = JSON.stringify(items);

  var csv = convertToCSV(items);

  var exportedFilename = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  // if (navigator.msSaveBlob) { // IE 10+
  //     navigator.msSaveBlob(blob, exportedFilename);
  // } else {
  var link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", exportedFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  // }
}

export default function FacilityResultsTable(props: FacilityResultsTableProps) {
  let allResults: any;
  let resSpec: any;
  let headers: TableHeader[];

  const pinnedFields = ["node_id", "epoch"];
  const fieldGroups: FieldGroup[] = [
    {
      groupName: "Overview",
      fields: [
        ...pinnedFields,
        "facility_type",
        "node_type",
        "captured_pct",
        "treated_pct",
        "retained_pct",
        "bypassed_pct",
      ],
    },
    {
      groupName: "Runoff Stats",
      fields: [
        ...pinnedFields,
        "runoff_volume_cuft_inflow",
        "runoff_volume_cuft_treated",
        "runoff_volume_cuft_retained",
        "runoff_volume_cuft_captured",
        "runoff_volume_cuft_bypassed",
      ],
    },
    {
      groupName: "Pollutant Mass Flow",
      fields: [
        ...pinnedFields,
        "TSS_load_lbs_inflow",
        "TSS_load_lbs_removed",
        "TN_load_lbs_inflow",
        "TN_load_lbs_removed",
        "TP_load_lbs_inflow",
        "TP_load_lbs_removed",
        "TZn_load_lbs_inflow",
        "TZn_load_lbs_removed",
        "TCu_load_lbs_inflow",
        "TCu_load_lbs_removed",
      ],
    },
    {
      groupName: "Pollutant Concentration",
      fields: [
        ...pinnedFields,
        "TSS_conc_mg/l_influent",
        "TSS_conc_mg/l_effluent",
        "TN_conc_mg/l_influent",
        "TN_conc_mg/l_effluent",
        "TP_conc_mg/l_influent",
        "TP_conc_mg/l_effluent",
        "TZn_conc_ug/l_influent",
        "TZn_conc_ug/l_effluent",
        "TCu_conc_ug/l_influent",
        "TCu_conc_ug/l_effluent",
      ],
    },
  ];

  const [resultState, setResultState] = useState<FacilityResultsTableState>({
    results: [],
    headers: [],
    loaded: false,
  });
  const [currentFields, setCurrentFields] = useState([
    ...pinnedFields,
    "facility_type",
    "node_type",
    "captured_pct",
    "treated_pct",
    "retained_pct",
    "bypassed_pct",
  ]);
  const [currentGroup, setCurrentGroup] = useState("Overview");

  const [currentEpoch, setCurrentEpoch] = useState("1980s");

  useEffect(() => {
    fetchTableData();
  }, [currentEpoch]);

  function fetchTableData() {
    let resources = [
      "/openapi.json",
      `/api/rest/results?ntype=tmnt_facility&epoch=${currentEpoch}`,
    ];
    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        resSpec = resArray[0].components.schemas.ResultView;
        allResults = resArray[1];
        headers = _buildTableColumns(resSpec.properties);
        setResultState({
          results: allResults,
          headers,
          loaded: true,
        });
      })
      .catch((err) => console.warn("Couldn't get results", err));
  }

  function getValueFormatter(fieldName: string, type: string) {
    let valueFormatter;
    valueFormatter =
      fieldName.toLowerCase().indexOf("pct") > 0 ? pctFormatter : numFormatter;
    if (type === "string") {
      valueFormatter = strFormatter;
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
        renderCell: (params) => {
          if (k === "node_id") {
            return (
              <Typography
                component={Link}
                to={`/app/bmp-detail/${params.row["node_id"]}`}
                sx={{
                  textDecoration: "none",
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: "bold",
                  fontSize: "inherit",
                }}
              >
                {params.value}
              </Typography>
            );
          } else {
            return params[k];
          }
        },
      });
    });
    return colArr;
  }

  function getCurrentColumns(
    allColumns: TableHeader[],
    columnsToDisplay: string[]
  ) {
    let res = [];
    columnsToDisplay.map((column) => {
      let fieldToAdd = allColumns.filter((header: TableHeader) => {
        return header.field === column;
      });
      res.push(fieldToAdd[0]);
    });
    return res;
  }

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
          <TextField
            sx={{ minWidth: "125px", mx: 5, alignSelf: "center" }}
            variant="outlined"
            label="Climate Epoch"
            select
            value={currentEpoch}
            onChange={(e) => {
              setCurrentEpoch(e.target.value);
            }}
            size="small"
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

  if (resultState.loaded) {
    console.log("Active Group: ", currentGroup);
    return (
      <Box
        sx={{
          height: 600,
          maxHeight: 1000,
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
          overflow: "scroll",
          width: "100%",
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
          <Box
            sx={(theme) => {
              return {
                display: "flex",
                margin: 1,
                [theme.breakpoints.up("xs")]: {
                  flexDirection: "column",
                },
              };
            }}
          >
            <Box
              sx={{
                display: "flex",
                my: 1,
                flexDirection: "column",
              }}
            >
              <Typography sx={{ my: 0.5 }} variant="h5">
                Facility Water Quality Results
              </Typography>
              <Typography variant="body1">
                View tabular data below, or click on individual facilities to
                view detailed stats
              </Typography>
            </Box>
            <ResultRefreshBox
              refreshHandler={fetchTableData}
              sx={{
                my: 1,
                width: { xs: "100%", md: "40%" },
                alignItems: "start",
              }}
            />
          </Box>
          <DataGrid
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                textOverflow: "clip",
                whiteSpace: "break-spaces",
                lineHeight: "1.35rem",
              },
              margin: 1,
            }}
            rows={resultState.results}
            columnHeaderHeight={100}
            columns={getCurrentColumns(resultState.headers, currentFields)}
            rowsPerPageOptions={[5, 25, 100]}
            getRowId={(row) => row["node_id"] + row["epoch"]}
            density={"compact"}
            slots={{ toolbar: CustomToolbar }}
            slotProps={{ toolbar: { csvOptions: { allColumns: true } } }}
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
