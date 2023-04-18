import CancelIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";

import { api_fetch } from "../../utils/utils";

// https://mui.com/x/react-data-grid/editing/#FullFeaturedCrudGrid.js

const patchDatabaseId = async (data) => {
  const id = data.id;

  const response = await api_fetch(`/api/rest/global_setting/cost/${id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.status <= 200) {
    const newData = await response.json();
    newData.id = newData.variable;
    console.log("patchDatabase Succeeded", newData);
    return newData;
  } else {
    console.error("patchDatabase Failed with data:", response, data);
  }

  return null;
};

async function getAllData() {
  const response = await api_fetch(`/api/rest/global_setting/cost`);
  const rjson = await response.json();
  rjson.forEach((r) => {
    r.id = r.variable;
  });

  return rjson;
}
export default function CostSettingsDataGrid() {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  // const [currentDataId, setCurrentDataId] = useState(null);
  // const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getAllData().then((res) => setRows(res));
  }, []);

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
    let data;
    if (newRow?.isNew) {
      data = await postDatabaseId({ ...newRow });
    } else {
      data = await patchDatabaseId({ ...newRow });
    }

    console.log(newRow, oldRow);

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
      field: "variable",
      headerName: "Variable",
      flex: 1,
      minWidth: 5,
    },
    {
      field: "value",
      headerName: "Value",
      flex: 1,
      minWidth: 5,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 5,
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
        ];
      },
    },
  ];

  return (
    <DataGrid
      autoheight
      disableColumnMenu
      disableMultipleRowSelection={true}
      disableRowSelectionOnClick={true}
      rowSelection={false}
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
  );
}
