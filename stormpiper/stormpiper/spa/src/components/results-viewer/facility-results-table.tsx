import {
  Chip,
  CircularProgress,
  Box,
  Typography,
  TextField,
  MenuItem,
  ListItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Link } from "react-router-dom";

import {
  api_fetch,
  pick,
  createDisplayName,
  numFormatter,
  pctFormatter,
  strFormatter,
} from "../../utils/utils";

import ResultRefreshBox from "../resultRefreshBox";
import { fieldAlias } from "../fieldAlias";

type TableHeader = {
  field: string;
  headerName: string;
  valueFormatter: (values: any) => any;
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

export default function FacilityResultsTable(props: FacilityResultsTableProps) {
  let allResults: any;
  let headers: TableHeader[];

  const infoFields = ["basinname", "subbasin", "facilitytype"];
  const pinnedFields = ["node_id", "basinname", "subbasin", "epoch"];
  const fieldGroups: FieldGroup[] = [
    {
      groupName: "Overview",
      fields: [
        ...pinnedFields,
        "facilitytype",
        "facility_type",
        "node_type",
        "captured_pct",
        "treated_pct",
        "retained_pct",
        "bypassed_pct",
      ],
    },
    {
      groupName: "Runoff Volume Capture",
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
      groupName: "Pollutant Load",
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
        "DEHP_load_lbs_inflow",
        "DEHP_load_lbs_removed",
        "PHE_load_lbs_inflow",
        "PHE_load_lbs_removed",
        "PYR_load_lbs_inflow",
        "PYR_load_lbs_removed",
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
        "DEHP_conc_mg/l_influent",
        "DEHP_conc_mg/l_effluent",
        "PHE_conc_mg/l_influent",
        "PHE_conc_mg/l_effluent",
        "PYR_conc_mg/l_influent",
        "PYR_conc_mg/l_effluent",
      ],
    },
  ];

  const [resultState, setResultState] = useState<FacilityResultsTableState>({
    results: [],
    headers: [],
    loaded: false,
  });
  const [currentFields, setCurrentFields] = useState(fieldGroups[0].fields);
  const [currentGroup, setCurrentGroup] = useState("Overview");

  const [currentEpoch, setCurrentEpoch] = useState("1980s");

  useEffect(() => {
    fetchTableData();
  }, [currentEpoch]);

  function fetchTableData() {
    let resources = [
      "/openapi.json",
      `/api/rest/results?ntype=tmnt_facility&epoch=${currentEpoch}`,
      "/api/rest/tmnt_facility",
    ];
    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        let resSpec = resArray[0].components.schemas.ResultView;
        let tmntSpec = resArray[0].components.schemas.TMNTView;
        allResults = resArray[1];
        let tmntInfo = resArray[2];

        allResults.forEach((element) => {
          const nid = element.node_id;
          const allinfo = tmntInfo.find((k) => k.node_id === nid);
          Object.assign(element, pick(allinfo, ...infoFields));
        });

        let resHeaders = _buildTableColumns(resSpec.properties);
        let headerFields = resHeaders.map((k) => k.field);
        let infoHeaders = _buildTableColumns(tmntSpec.properties).filter(
          (k) => !headerFields.includes(k.field)
        );

        headers = [...resHeaders, ...infoHeaders];

        setResultState({
          results: allResults.toSorted((a, b) => {
            const aid = a.subbasin + a.node_id;
            const bid = b.subbasin + b.node_id;
            if (aid > bid) return 1;
            if (bid > aid) return -1;
            return 0;
          }),
          headers,
          loaded: true,
        });
      })
      .catch((err) => console.warn("Couldn't get results", err));
  }

  function getValueFormatter(fieldName: string, type: string) {
    if (type === "string") {
      return strFormatter;
    }

    return fieldName.toLowerCase().indexOf("pct") > 0
      ? pctFormatter
      : numFormatter;
  }

  function inferType(obj: { type: string; anyOf: [{ type: string }] }) {
    let type = obj?.type;
    if (type != null) {
      return type;
    } else {
      let t = obj?.anyOf.find((t) => t.type != null)?.type;
      return t || "string";
    }
  }

  function getHeaderName(k, props) {
    let headername = fieldAlias?.[k] || props[k]?.title || k;
    if (k.includes("_conc_") || k.includes("_load_")) {
      headername = createDisplayName(k);
    }

    return headername;
  }

  function _buildTableColumns(props: {
    [key: string]: { title: string; type: string; anyOf: [{ type: string }] };
  }): TableHeader[] {
    let colArr: TableHeader[] = [];
    Object.keys(props).map((k) => {
      let type = inferType(props[k]);
      colArr.push({
        field: k,
        headerName: getHeaderName(k, props),
        width: 150, //pinnedFields.includes(k) ? 100 : 100 + (props[k].title.length - 20),
        headerAlign: "center",
        align: "center",
        valueFormatter: getValueFormatter(k, type),
        type: type,
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
            my: 2,
          }}
        >
          <Box sx={{ minWidth: "250px", mx: 2 }}>
            <GridToolbarExport
              csvOptions={{
                allColumns: true,
                fileName:
                  "Tacoma_Watersheds_BMP_" +
                  currentEpoch +
                  "_" +
                  currentGroup?.replaceAll(" ", "_") +
                  "_" +
                  new Date().toLocaleString("en-US", {
                    dateStyle: "short",
                  }),
              }}
              printOptions={{ disableToolbarButton: true }}
            />
            <TextField
              sx={{ minWidth: "125px", ml: 3, alignSelf: "center" }}
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
                py: 1,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <GridToolbarQuickFilter />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "flex-start",
              flexWrap: "wrap",
              listStyle: "none",
              p: 0,
              m: 0,
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
    return (
      <Box
        sx={{
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
            autoHeight
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                textOverflow: "clip",
                whiteSpace: "break-spaces",
                lineHeight: "1.35rem",
              },
              m: 1,
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            rows={resultState.results}
            columnHeaderHeight={100}
            columns={getCurrentColumns(resultState.headers, currentFields)}
            pageSizeOptions={[5, 25, 100]}
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
