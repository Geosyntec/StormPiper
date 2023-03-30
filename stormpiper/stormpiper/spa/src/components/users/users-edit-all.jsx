import CancelIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/DeleteOutlined";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { api_fetch } from "../../utils/utils";
import { FullSpan, TwoColGrid } from "../base/two-col-grid";
import { Grid } from "@mui/material";
import { ConfirmDeleteModal } from "./confirm-delete-modal";

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
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
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
      editable: true,
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
    processDeleteCurrentUserId();
    handleModalClose();
  };

  const getRowData = (id) => rows.find((x) => x.id == id);

  return (
    <>
      <ConfirmDeleteModal
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        handleConfirmDelete={handleConfirmDelete}
        email={`${getRowData(currentUserId)?.email || ""}`}
      />
      <TwoColGrid
        sx={{
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <FullSpan sx={{ height: "600px" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            columnVisibilityModel={{
              // Hide columns listed here, the other columns will remain visible
              id: false,
            }}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.error(error)}
          />
        </FullSpan>
      </TwoColGrid>
    </>
  );
}
