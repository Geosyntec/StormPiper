import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const f =
  "f: str (optional, default=json, [json, geojson]) Format of response data";
const ntype =
  "ntype: string (optional, default=null, [land_surface, tmnt_facility]) Node type filter";
const limit = "limit: int (optional, default=1e6) Number of records to return";
const offset = "offset: int (optional, default=0) Start from index";
const epoch =
  "epoch: string (optional, default=1980s, [all, 1980s, 2030s, 2050s, 2080s]) Climate epoch filter";

const routesWithToken = [
  {
    url: "/api/rest/tmnt_facility/token/{token}?f=json&limit=1000000&offset=0",
    description: `Get attributes or geojson for all tmnt facilities.
      ${f}
      ${limit}
      ${offset}
      `,
  },
  {
    url: "/api/rest/tmnt_facility/{altid}/token/{token}",
    description: "Get attributes for tmnt facility with given altid.",
  },
  {
    url: "/api/rest/tmnt_delineation/token/{token}?f=json&limit=1000000&offset=0",
    description: `Get attributes for all delineations.
      ${f}
      ${limit}
      ${offset}
      `,
  },
  {
    url: "/api/rest/tmnt_delineation/{altid}/token/{token}?f=json",
    description: `Get attributes for specific delineation altid.
      ${f}
      `,
  },
  {
    url: "/api/rest/subbasin/token/{token}?f=json&limit=1000000&offset=0&epoch=1980s",
    description: `Get attributes or geojson for all subbasins.
      ${f}
      ${limit}
      ${offset}
      ${epoch}
    `,
  },
  {
    url: "/api/rest/subbasin/{subbasin_id}/token/{token}?epoch=1980s",
    description: `Get attributes or geojson for specific subbasin.
      ${epoch}
      `,
  },
  {
    url: "/api/rest/results/token/{token}?ntype=null&limit=1000000&offset=0&epoch=1980s",
    description: `Get attributes or geojson for all subbasins.
      ${ntype}
      ${limit}
      ${offset}
      ${epoch}
      `,
  },
  {
    url: "/api/rest/results/{node_id}/token/{token}?epoch=1980s",
    description: `Get attributes or geojson for all subbasins.
      ${epoch}
      `,
  },
];

const CopyToClipboardButton = ({ data }) => {
  const handleClick = () => {
    navigator.clipboard.writeText(data);
    console.log(data);
  };

  return (
    <Tooltip title="Copy to Clipboard">
      <IconButton onClick={handleClick}>
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
  );
};

export default function TokenRouteTable({ token }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="token route table">
        <TableHead>
          <TableRow>
            <TableCell>Data Integration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routesWithToken.map((row) => {
            const link = `${window.location.origin}${row.url.replace(
              "{token}",
              token
            )}`;

            return (
              <TableRow
                key={row.url}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box>
                    <CopyToClipboardButton data={link} />
                    <Typography component="span" variant="subtitle2">
                      {link}
                    </Typography>
                  </Box>
                  <Box ml={5}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {row.description}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
