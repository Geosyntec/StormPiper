import { ReadonlyStripedDataGrid } from "../base/striped-data-grid-readonly";
import { pick } from "../../utils/utils";

const volFormatter = (params) => {
  if (params.value == null) {
    return "0";
  }
  return Number(parseFloat(params.value).toPrecision(3)).toLocaleString();
};

const pctFormatter = (params) => {
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
    headerName: "Mean Annual Water Balance",
    flex: 1,
    minWidth: 250,
  },
];

const column_groups = [];
const epochs = ["1980s", "2030s", "2050s", "2080s"];

for (let e of epochs) {
  const vol_id = `${e}-volume`;
  const pct_id = `${e}-pct`;

  column_groups.push({
    groupId: e,
    headerName: `Climate of ${e}`,
    children: [{ field: vol_id }, { field: pct_id }],
  });

  columns.push({
    field: vol_id,
    headerName: "Volume (cuft)",
    flex: 1,
    minWidth: 80,
    valueFormatter: volFormatter,
  });

  columns.push({
    field: pct_id,
    headerName: "Percent of Inflow",
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
    row_name: "Total Inflow Volume",
    col_fields: [
      { data_label: "runoff_volume_cuft_inflow", partial_col_name: "volume" },
    ],
  },
  {
    row_name: "Volume Treated and Discharged",
    col_fields: [
      {
        data_label: "runoff_volume_cuft_treated",
        partial_col_name: "volume",
      },
      { data_label: "treated_pct", partial_col_name: "pct" },
    ],
  },
  {
    row_name: "Volume Retained or Infiltrated",
    col_fields: [
      {
        data_label: "runoff_volume_cuft_retained",
        partial_col_name: "volume",
      },
      { data_label: "retained_pct", partial_col_name: "pct" },
    ],
  },
  {
    row_name: "Volume Bypassed (Untreated)",
    col_fields: [
      {
        data_label: "runoff_volume_cuft_bypassed",
        partial_col_name: "volume",
      },
      { data_label: "bypassed_pct", partial_col_name: "pct" },
    ],
  },
  {
    row_name: "Volume Captured",
    col_fields: [
      {
        data_label: "runoff_volume_cuft_captured",
        partial_col_name: "volume",
      },
      { data_label: "captured_pct", partial_col_name: "pct" },
    ],
  },
];

const all_cols = new Set([
  "node_id",
  "epoch",
  ...field_def.flatMap((x) => x.col_fields.map((y) => y.data_label)),
]);

export default function BMPVolumeBalance({ rows }) {
  let volume_data = rows.map((x) => pick(x, ...all_cols));
  let data = [];

  for (let field of field_def) {
    let d = { id: field.row_name, name: field.row_name };
    for (let e of epochs) {
      const re = volume_data.find((x) => x.epoch === e);
      for (let c of field.col_fields) {
        const col_name = `${e}-${c.partial_col_name}`;
        d[col_name] = re[c.data_label];
      }
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
