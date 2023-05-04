import { ReadonlyStripedDataGrid } from "../base/striped-data-grid-readonly";
import { pick } from "../../utils/utils";

const formatLoad = (params) => {
  if (params.value == null) {
    return "0";
  }
  const n = Number(parseFloat(params.value).toPrecision(3)).toLocaleString();
  const units = params.id.split("-").pop() || "lbs";
  return `${n} ${units}`;
};

const columns = [
  { field: "id" },
  {
    field: "name",
    headerName: "Mean Annual Load Generated",
    flex: 1,
    minWidth: 250,
  },
];

const column_groups = [];
const epochs = ["1980s", "2030s", "2050s", "2080s"];

for (let e of epochs) {
  const vol_id = `${e}-load`;

  column_groups.push({
    groupId: e,
    headerName: `Climate of ${e}`,
    children: [{ field: vol_id }],
  });

  columns.push({
    field: vol_id,
    headerName: "Load Generated",
    flex: 1,
    minWidth: 80,
    valueFormatter: formatLoad,
  });
}

columns.forEach((x) => {
  x.sortable = false;
});

const field_def = [
  {
    row_name: "Runoff Volume",
    units: "cuft",
    prefix: "runoff",
  },
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

const all_cols = new Set([
  "node_id",
  "epoch",
  ...field_def.flatMap((x) => [`${x.prefix}_${x.units}`]),
]);

export default function DelineationLoadGenerated({ rows }) {
  let slim_data = rows.map((x) => pick(x, ...all_cols));
  let data = [];

  for (let field of field_def) {
    let d = {
      id: `${field.prefix}-${field.units}`,
      name: field.row_name,
      units: field.units,
    };
    for (let e of epochs) {
      const re = slim_data.find((x) => x.epoch === e);
      const load_col_name = `${e}-load`;
      const load_col = `${field.prefix}_${field.units}`;
      d[load_col_name] = re[load_col];
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
