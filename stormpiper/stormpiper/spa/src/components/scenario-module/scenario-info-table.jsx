import CancelIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/DeleteOutlined";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Link, Modal, Typography } from "@mui/material";
import { api_fetch } from "../../utils/utils";

// https://mui.com/x/react-data-grid/row-height/#dynamic-row-height
// https://mui.com/x/react-data-grid/row-height/#ExpandableCells.js

function ExpandableCell({ formattedValue, value }) {
  const [cellExpanded, setCellExpanded] = useState(false);

  const str = formattedValue || String(value || "");
  const maxChars = 35;

  return (
    <Box>
      {cellExpanded ? str : str.slice(0, maxChars)}&nbsp;
      {str.length > maxChars && (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <Link
          type="button"
          component="button"
          sx={{ fontSize: "inherit" }}
          onClick={() => setCellExpanded(!cellExpanded)}
        >
          {cellExpanded ? "view less" : "view more"}
        </Link>
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

async function getAllScenarios() {
  const response = await api_fetch(`/api/rest/scenario`);
  const data = await response.json();
  return data;
}

export function ScenarioInfoTable() {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [currentScenarioId, setCurrentScenarioId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    getAllScenarios().then((res) => setRows(res));
  }, [getAllScenarios]);

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id) => () => {
    setCurrentScenarioId(id);
    navigate(`/app/scenario/${id}`);
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
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
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

  const ModalConfirmDelete = () => {
    const style = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: "300px", sm: "60ch" },
      maxWidth: 450,
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      p: 4,
      display: "flex",
      flexDirection: "column",
    };
    return (
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are you sure you want to delete this user?
          </Typography>
          <Typography
            id="modal-modal-description"
            align="center"
            sx={{ mt: 2 }}
          >
            {`${getRowData(currentScenarioId)?.name || ""}`}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              sx={{ width: "100px" }}
              onClick={handleModalClose}
              variant="outlined"
              color="primary"
            >
              Cancel
            </Button>
            <Button
              sx={{ width: "200px" }}
              onClick={handleConfirmDelete}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Confirm Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

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
        columnVisibilityModel={{
          // Hide columns listed here, the other columns will remain visible
          id: false,
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
      <ModalConfirmDelete />
    </Box>
  );
}
