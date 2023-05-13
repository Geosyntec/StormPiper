import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip, Typography, Link as ATag } from "@mui/material";
import { api_fetch } from "../../utils/utils";
import { ConfirmDeleteModal } from "../base/confirm-delete-modal";

// https://mui.com/x/react-data-grid/row-height/#dynamic-row-height
// https://mui.com/x/react-data-grid/row-height/#ExpandableCells.js

function ExpandableCell({ formattedValue, value }) {
  const [cellExpanded, setCellExpanded] = useState(false);

  const str = formattedValue || String(value || "");
  const maxChars = 35;

  return (
    <Box>
      {cellExpanded ? str : str.slice(0, maxChars)}
      {str.length > maxChars && (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <>
          {cellExpanded ? "" : "..."}&nbsp;
          <ATag
            component="button"
            sx={{
              fontSize: "inherit",
              textDecoration: "none",
            }}
            onClick={() => setCellExpanded(!cellExpanded)}
          >
            {cellExpanded ? "view less" : "view more"}
          </ATag>
        </>
      )}
    </Box>
  );
}

async function deleteScenarioDatabaseId(id) {
  const response = await api_fetch(`/api/rest/scenario/${id}`, {
    method: "delete",
  });

  const text = await response.text();
  const status = response.status;

  return { status, text };
}

export function ScenarioInfoTable({ data, dataRefresher }) {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [currentScenarioId, setCurrentScenarioId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    setCurrentScenarioId(id);
    handleModalOpen();
    return;
  };

  const processDeleteCurrentScenarioId = async () => {
    const id = currentScenarioId;
    let { status, text } = await deleteScenarioDatabaseId(id);
    if (status === 204) {
      setRows(rows.filter((row) => row.id !== id));
      dataRefresher();
      return;
    }
    console.error("delete ID failed.", text);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow, oldRow) => {
    const data = newRow;
    if (!data) {
      return oldRow;
    }
    const updatedRow = { ...data, isNew: false };
    setRows(rows.map((row) => (row.id === data.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const dateFormatter = (params) => {
    if (params.value == null) {
      return "";
    }
    const valueDate = new Date(params.value);
    const valueLocale = valueDate.toLocaleString("en-US", {
      timeZoneName: "short",
    });
    const [date, time, ..._] = valueLocale.split(",");
    return `${date.trim()}\n${time.trim()}`;
  };

  const dateRenderer = (cellValues) => {
    return (
      <div style={{ whiteSpace: "pre-line" }}>{cellValues.formattedValue}</div>
    );
  };

  const columns = [
    { field: "id" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          component={Link}
          to={`/app/scenario/${params.id}`}
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
            fontSize: "inherit",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "info",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => <ExpandableCell {...params} />,
      valueFormatter: (params) => {
        const value = params?.value?.description;
        if (!value) {
          return "";
        }
        return `${value}`;
      },
    },
    {
      field: "updated_by",
      headerName: "Updated By",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "time_updated",
      headerName: "Updated At",
      flex: 1,
      minWidth: 150,
      valueFormatter: dateFormatter,
      renderCell: dateRenderer,
    },
    {
      field: "created_by",
      headerName: "Created By",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "time_created",
      headerName: "Created At",
      flex: 1,
      minWidth: 150,
      valueFormatter: dateFormatter,
      renderCell: dateRenderer,
    },
    {
      field: "result_time_updated",
      headerName: "Results Last Solved At",
      flex: 1,
      minWidth: 150,
      valueFormatter: dateFormatter,
      renderCell: dateRenderer,
    },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      maxWidth: 150,
      minWidth: 100,
      cellClassName: "actions",
      getActions: (props) => {
        const id = props.row.id;
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <Tooltip title="Save Entry">
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="Cancel">
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }

        return [
          <Tooltip title="Edit Entry">
            <GridActionsCellItem
              component={Link}
              to={`/app/scenario/${id}`}
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              // onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Delete Entry">
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const handleConfirmDelete = () => {
    processDeleteCurrentScenarioId();
    handleModalClose();
  };
  const handleRowClick = (params) => {
    console.log(`Scenario "${params.row.name}" clicked`);
  };

  const getRowData = (id) => rows.find((x) => x.id == id);

  return (
    <Box
      sx={{
        height: 500,
        // width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        sx={{
          "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
            py: "8px",
          },
          "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
            py: "15px",
          },
          "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
            py: "22px",
          },
        }}
        rows={rows}
        columns={columns}
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide columns status and traderName, the other columns will remain visible
              id: false,
              time_updated: false,
              created_by: false,
              time_created: false,
            },
          },
        }}
        editMode="row"
        onRowClick={handleRowClick}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) => console.error(error)}
        getRowHeight={() => "auto"}
        getEstimatedRowHeight={() => 200}
      />
      <ConfirmDeleteModal
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        handleConfirmDelete={handleConfirmDelete}
        confirmationMessage={"Are you sure you want to delete this scenario?"}
        dataIdentifier={`${getRowData(currentScenarioId)?.name || ""}`}
      />
    </Box>
  );
}
