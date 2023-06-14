import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

export function BMPReadOnlyInfo({ data, ...props }) {
  const fields = [
    { title: "ALTID", name: "altid" },
    { title: "Facility Type (Tacoma GIS)", name: "facilitytype" },
    { title: "Common Name", name: "commonname" },
    { title: "Facility Detail", name: "faciliitydetail" },
    { title: "Flow Control Type", name: "flowcontroltype" },
    { title: "Water Quality Type", name: "waterqualitytype" },
    { title: "Basin Name", name: "basinname" },
    { title: "Subbasin", name: "subbasin" },
  ];

  return (
    <Box {...props}>
      <TableContainer sx={{ py: 2 }}>
        <Table size="small" aria-label="simple table">
          <TableBody>
            {fields.map((row) => (
              <TableRow
                key={row.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {row.name in data && (
                  <>
                    <TableCell component="th" scope="row">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={(theme) => theme.palette.grey[600]}
                      >
                        {row.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{data?.[row.name]}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
