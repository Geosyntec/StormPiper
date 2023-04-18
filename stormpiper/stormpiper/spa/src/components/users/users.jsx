import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Typography, Tooltip } from "@mui/material";
import { api_fetch } from "../../utils/utils";

// https://mui.com/x/react-data-grid/editing/#FullFeaturedCrudGrid.js

const patchUserDatabaseId = async (data) => {
  const id = data.id;

  const response = await api_fetch(`/api/rest/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.status <= 200) {
    const newData = await response.json();
    console.log("patchDatabase Succeeded", newData);
    return newData;
  } else {
    console.error("patchDatabase Failed with data:", response, data);
  }

  return null;
};

async function deleteUserDatabaseId(id) {
  const response = await api_fetch(`/api/rest/users/${id}`, {
    method: "delete",
  });

  const text = await response.text();
  const status = response.status;

  return { status, text };
}

async function getAllUsers() {
  const response = await api_fetch(`/api/rest/users`);
  return await response.json();
}

export default function Users() {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    getAllUsers().then((res) => setRows(res));
  }, [getAllUsers]);

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id) => () => {
    setCurrentUserId(id);
    navigate(`/app/manage-users/${id}`);
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    setCurrentUserId(id);
    handleModalOpen();
    return;
  };

  const processDeleteCurrentUserId = async () => {
    const id = currentUserId;
    let { status, text } = await deleteUserDatabaseId(id);
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
    const data = await patchUserDatabaseId({ ...newRow });
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

  const columns = [
    { field: "id" },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "role",
      headerName: "Role",
      type: "singleSelect",
      minWidth: 200,
      valueOptions: [
        { label: "Public", value: "public" },
        { label: "Read-only", value: "reader" },
        { label: "User/Editor", value: "editor" },
        { label: "User Admin", value: "user_admin" },
        { label: "System Admin", value: "admin" },
      ],
    },
    {
      field: "first_name",
      headerName: "First name",
    },
    {
      field: "last_name",
      headerName: "Last name",
    },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      valueGetter: (params) =>
        `${params.row.first_name || ""} ${params.row.last_name || ""}`,
    },
    {
      field: "is_verified",
      headerName: "Is Verified",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
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
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
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
    processDeleteCurrentUserId();
    handleModalClose();
  };

  const getRowData = (id) => rows.find((x) => x.id == id);

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
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <div>
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
              {`${getRowData(currentUserId)?.email || ""}`}
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
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
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
          initialState={{
            columns: {
              columnVisibilityModel: {
                // Hide columns status and traderName, the other columns will remain visible
          id: false,
              },
            },
        }}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) => console.error(error)}
      />
    </Box>
  );
}
