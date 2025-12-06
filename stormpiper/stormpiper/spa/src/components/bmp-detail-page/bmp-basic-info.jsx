import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

const DEFAULT_FIELDS = [
  { title: "ALTID", name: "altid" },
  { title: "Facility Type (Tacoma GIS)", name: "facilitytype" },
  { title: "Common Name", name: "commonname" },
  { title: "Facility Detail", name: "facilitydetail" },
  { title: "Infiltration", name: "infiltrated" },
  { title: "Flow Control Type", name: "flowcontroltype" },
  { title: "Water Quality Type", name: "waterqualitytype" },
  { title: "Basin Name", name: "basinname" },
  { title: "Subbasin", name: "subbasin" },
];

export function BMPReadOnlyInfo({ data, fields, ...props }) {
  fields = fields || DEFAULT_FIELDS;
  const field_names = fields.map((x) => x.name);
  const found = field_names.some((r) => Object.keys(data).includes(r));

  if (!found) return null;

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
