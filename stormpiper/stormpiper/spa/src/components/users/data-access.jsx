import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
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
const altid =
  "altid: string (optional, default=null, the unique id of the feature in Tacoma GIS";
const relid =
  "relid: string (optional, default=null, the altid of a related feature in Tacoma GIS";

const routesWithToken = [
  {
    url: "/api/rest/tmnt_facility/token/{token}?f=json&limit=1000000&offset=0",
    description: `Get attributes or geojson for all structural treatment facilities. This includes treatment results for the 1980's epoch.
      ${f}
      ${limit}
      ${offset}
      `,
  },
  {
    url: "/api/rest/tmnt_facility/{altid}/token/{token}",
    description:
      "Get attributes for specific structural treatment facility with given altid. This includes treatment results for the 1980's epoch.",
  },

  {
    url: "/api/rest/tmnt_delineation/token/{token}?f=json&limit=1000000&offset=0&altid=null&relid=null",
    description: `Get altid, relid (the altid of the related facility), and node_id (the id used by the Tacoma Watershed Insights tool) for structural treatment facility delineations.
      ${f}
      ${limit}
      ${offset}
      ${altid}
      ${relid}
      `,
  },
  {
    url: "/api/rest/subbasin/token/{token}?f=json&limit=1000000&offset=0",
    description: `Get attributes or geojson for all subbasins. This includes water quality data for the 1980's epoch.
      ${f}
      ${limit}
      ${offset}
      `,
  },
  {
    url: "/api/rest/subbasin/{subbasin_id}/token/{token}",
    description: `Get attributes or geojson for specific subbasin. This includes water quality data for the 1980's epoch.`,
  },
  {
    url: "/api/rest/subbasin/wq/token/{token}?f=json&limit=1000000&offset=0&epoch=1980s",
    description: `Get water quality results for all subbasins for any epoch.
      ${f}
      ${limit}
      ${offset}
      ${epoch}
      `,
  },
  {
    url: "/api/rest/subbasin/wq/{subbasin_id}/token/{token}?epoch=1980s",
    description: `Get water quality results for specific subbasin for any epoch.
      ${epoch}
      `,
  },
  {
    url: "/api/rest/results/token/{token}?ntype=null&limit=1000000&offset=0&epoch=1980s",
    description: `Raw output from the water quality engine. It provides detailed water quality modeling results for any node, where nodes include bmp drainage areas, structural BMPs, aggregated subbasins, and aggregated watersheds.
      ${ntype}
      ${limit}
      ${offset}
      ${epoch}
      `,
  },
  {
    url: "/api/rest/results/{node_id}/token/{token}?epoch=1980s",
    description: `Raw output from the water quality engine. It provides detailed water quality modeling results for a specific node, where nodes include bmp drainage areas, structural BMPs, aggregated subbasins, and aggregated watersheds.
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
    <TableContainer>
      <Table size="small" aria-label="token route table">
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
