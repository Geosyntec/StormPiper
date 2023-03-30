import { StripedDataGrid } from "./striped-data-grid";

export function ReadonlyStripedDataGrid(props) {
  return (
    <StripedDataGrid
      autoHeight
      disableColumnMenu
      disableMultipleRowSelection={true}
      disableRowSelectionOnClick={true}
      rowSelection={false}
      hideFooter
      experimentalFeatures={{ columnGrouping: true }}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
      sx={{
        "& .MuiDataGrid-columnHeaderTitle": {
          textOverflow: "clip",
          whiteSpace: "break-spaces",
          lineHeight: "1.35rem",
        },
      }}
      columnVisibilityModel={{
        // Hide columns listed here, the other columns will remain visible
        id: false,
      }}
      {...props}
    />
  );
}
