import { ReadonlyStripedDataGrid } from "../base/striped-data-grid-readonly";
import { pick } from "../../utils/utils";

const formatLoadReduced = (params) => {
  if (params.value == null) {
    return "0";
  }
  const n = Number(parseFloat(params.value).toPrecision(3)).toLocaleString();
  const units = params.id.split("-").pop() || "lbs";
  return `${n} ${units}`;
};

const formatPercentReduced = (params) => {
  if (params.value == null) {
    return "--";
  }
  const n = parseFloat(params.value).toFixed(1);
  return `${n}%`;
};

const columns = [
  { field: "id" },
  {
    field: "name",
    headerName: "Mean Annual Load",
    flex: 1,
    minWidth: 250,
  },
];

const column_groups = [];
const epochs = ["1980s", "2030s", "2050s", "2080s"];

for (let e of epochs) {
  const vol_id = `${e}-load`;
  const pct_id = `${e}-pct`;

  column_groups.push({
    groupId: e,
    headerName: `Climate of ${e}`,
    children: [{ field: vol_id }, { field: pct_id }],
  });

  columns.push({
    field: vol_id,
    headerName: "Load Reduced",
    flex: 1,
    minWidth: 80,
    valueFormatter: formatLoadReduced,
  });

  columns.push({
    field: pct_id,
    headerName: "Percent Reduced",
    flex: 1,
    minWidth: 80,
    valueFormatter: formatPercentReduced,
  });
}

columns.forEach((x) => {
  x.sortable = false;
});

const field_def = [
  {
    row_name: "Total Suspended Solids",
    units: "lbs",
    prefix: "TSS",
  },

  {
    row_name: "Total Nitrogen",
    units: "lbs",
    prefix: "TN",
  },
  {
    row_name: "Total Phosphorus",
    units: "lbs",
    prefix: "TP",
  },
  {
    row_name: "Total Copper",
    units: "g",
    prefix: "TCu",
  },
  {
    row_name: "Total Zinc",
    units: "g",
    prefix: "TZn",
  },
  {
    row_name: "PYR",
    units: "g",
    prefix: "PYR",
  },
  {
    row_name: "PHE",
    units: "g",
    prefix: "PHE",
  },
  {
    row_name: "DEHP",
    units: "g",
    prefix: "DEHP",
  },
];

export const all_cols = new Set([
  "node_id",
  "epoch",
  ...field_def.flatMap((x) => [
    `${x.prefix}_load_${x.units}_removed`,
    `${x.prefix}_load_pct_removed`,
  ]),
]);

export default function BMPLoadReduction({ rows }) {
  let slim_data = rows.map((x) => pick(x, ...all_cols));
  let data = [];

  for (let field of field_def) {
    let d = {
      id: `${field.prefix}-${field.units}`,
      name: field.row_name,
    };
    for (let e of epochs) {
      const re = slim_data.find((x) => x.epoch === e);

      const load_col_name = `${e}-load`;
      const load_col = `${field.prefix}_load_${field.units}_removed`;
      d[load_col_name] = re[load_col];

      const pct_col_name = `${e}-pct`;
      const pct_col = `${field.prefix}_load_pct_removed`;
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
