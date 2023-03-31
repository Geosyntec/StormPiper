import { Chip, Button, CircularProgress, Box, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { api_fetch } from "../utils/utils";

type TableHeader = {
  field: string;
  headerName: string;
  valueFormatter: (values: any) => any;
  // flex?:number,
  headerAlign: string;
  align: string;
  width?: number;
};

type FieldGroup = {
  groupName: string;
  fields: string[];
};

type ResultsTableProps = {
  displayController: VoidFunction;
  nodes?: "all" | string;
  displayState: boolean;
};

type ResultsTableState = {
  results: [];
  headers: { [k: string]: TableHeader };
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

export default function ResultsTable(props: ResultsTableProps) {
  let allResults: any;
  let resSpec: any;
  let headers: { [k: string]: TableHeader };
  // let headers:TableHeader[] = []

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

  const [resultState, setResultState] = useState<ResultsTableState>({
    results: [],
    // headers:{"field":{field:"",headerName:""}},
    headers: {},
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

  useEffect(() => {
    if (!props.displayState) return;

    let resources = ["/openapi.json", "/api/rest/results"];
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
  }, [props.displayState]);

  function _buildTableColumns(props: {
    [key: string]: { title: string; type: string };
  }): { [k: string]: TableHeader } {
    // let colArr:TableHeader[] = []
    let colArr: { [k: string]: TableHeader } = {};
    Object.keys(props).map((k) => {
      colArr[k] = {
        field: k,
        headerName: props[k].title,
        width: pinnedFields.includes(k)
          ? 150
          : 200 + (props[k].title.length - 20) * 5,
        headerAlign: "center",
        align: "center",
        valueFormatter: (params) => {
          // console.log("Formatting value: ",params)
          if (params.value && params.value == null) {
            return "";
          }
          if (props[k].type === "number") {
            return new Intl.NumberFormat("en-US", {
              maximumSignificantDigits: 3,
            }).format(params.value);
          } else {
            return params.value;
          }
        },
      };
    });
    console.log("Displaying: ", colArr);
    return colArr;
  }

  if (resultState.loaded) {
    console.log("Active Group: ", currentGroup);
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            height: "95%",
            width: "100%",
            flexGrow: 1,
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Typography
              sx={{ margin: (theme) => theme.spacing(0.5) }}
              variant="h5"
            >
              Water Quality Results
            </Typography>
            <ul
              style={{
                display: "flex",
                "justify-content": "center",
                "flex-wrapt": "wrap",
                "list-style": "none",
                padding: "0.5rem",
                margin: 0,
              }}
            >
              {fieldGroups.map((group) => {
                return (
                  <li>
                    <Chip
                      sx={{
                        margin: (theme) => theme.spacing(0.5),
                        backgroundColor: (theme) =>
                          group.groupName === currentGroup
                            ? theme.palette.warning.main
                            : theme.palette.grey[100],
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
            {/* <Button onClick={()=>setFilterModel({items:[{columnField:'node_id',operator:'contains',value:props.currentNode}]})}>Select Current Facility</Button> */}
            <Button
              onClick={() =>
                exportCSVFile(
                  resultState.results,
                  "testResults",
                  resultState.headers
                )
              }
            >
              Download Results
            </Button>
            <Box
              sx={{
                position: "absolute",
                justifyContent: "end",
                right: "2%",
                top: "0%",
              }}
            >
              <h4
                style={{
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={props.displayController}
              >
                &#10005;
              </h4>
            </Box>
          </Box>
          <DataGrid
            sx={{
              overflowX: "scroll",
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "scroll",
              },
            }}
            rows={resultState.results}
            // columns={resultState.headers.filter(h=>currentFields.includes(h.field))}
            columns={currentFields.map<{ field: string; headerName: string }>(
              (f) => {
                return {
                  field: resultState.headers[f].field,
                  headerName: resultState.headers[f].headerName,
                };
              }
            )}
            rowsPerPageOptions={[5, 25, 100]}
            disableSelectionOnClick
            getRowId={(row) => row["node_id"] + row["epoch"]}
            density={"compact"}
            // getRowHeight={() => 'auto'}
            // getEstimatedRowHeight={() => 200}
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
