import { ReadonlyStripedDataGrid } from "../base/striped-data-grid-readonly";
import { pick, concFormatter, pctFormatter } from "../../utils/utils";

const columns = [
  { field: "id" },
  {
    field: "name",
    headerName: "Mean Annual Concentration",
    flex: 1,
    minWidth: 250,
  },
];

const column_groups = [];
const epochs = ["1980s", "2030s", "2050s", "2080s"];

for (let e of epochs) {
  const vol_id = `${e}-conc`;
  const pct_id = `${e}-pct`;

  column_groups.push({
    groupId: e,
    headerName: `Climate of ${e}`,
    children: [{ field: vol_id }, { field: pct_id }],
  });

  columns.push({
    field: vol_id,
    headerName: "Effluent Conc.",
    flex: 1,
    minWidth: 80,
    valueFormatter: concFormatter,
  });

  columns.push({
    field: pct_id,
    headerName: "Percent Reduced",
    flex: 1,
    minWidth: 80,
    valueFormatter: pctFormatter,
  });
}

columns.forEach((x) => {
  x.sortable = false;
});

const field_def = [
  {
    row_name: "Total Suspended Solids",
    units: "mg/l",
    prefix: "TSS",
  },
  {
    row_name: "Total Nitrogen",
    units: "ug/l",
    prefix: "TN",
  },
  {
    row_name: "Total Phosphorus",
    units: "ug/l",
    prefix: "TP",
  },
  {
    row_name: "Total Copper",
    units: "ug/l",
    prefix: "TCu",
  },
  {
    row_name: "Total Zinc",
    units: "ug/l",
    prefix: "TZn",
  },
  {
    row_name: "PYR",
    units: "ug/l",
    prefix: "PYR",
  },
  {
    row_name: "PHE",
    units: "ug/l",
    prefix: "PHE",
  },

  {
    row_name: "DEHP",
    units: "ug/l",
    prefix: "DEHP",
  },
];

export const all_cols = new Set([
  "node_id",
  "epoch",
  ...field_def.flatMap((x) => [
    `${x.prefix}_conc_${x.units}_effluent`,
    `${x.prefix}_conc_pct_removed`,
  ]),
]);

export default function BMPConcReduction({ rows }) {
  let slim_data = rows.map((x) => pick(x, ...all_cols));
  let data = [];

  for (let field of field_def) {
    let d = {
      id: `${field.prefix}-${field.units}`,
      name: field.row_name,
    };
    for (let e of epochs) {
      const re = slim_data.find((x) => x.epoch === e);

      const conc_col_name = `${e}-conc`;
      const conc_col = `${field.prefix}_conc_${field.units}_effluent`;
      d[conc_col_name] = re[conc_col];

      const pct_col_name = `${e}-pct`;
      const pct_col = `${field.prefix}_conc_pct_removed`;
      d[pct_col_name] = re[pct_col];
    }
    data.push(d);
  }

  return (
    <ReadonlyStripedDataGrid
      rows={data}
      columns={columns}
      columnGroupingModel={column_groups}
    />
  );
}
