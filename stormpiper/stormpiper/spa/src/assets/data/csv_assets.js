import { csv } from "d3-fetch";
import field_manifest from "./field_manifest.csv?url";
import goals from "./goals.csv?url";
import result_fields from "./result_fields.csv?url";
import result_groups from "./result_groups.csv?url";

const field_manifest_csv = csv(field_manifest).catch((err) =>
  console.log("CSV fetch error: ", err)
);
const goals_csv = csv(goals).catch((err) =>
  console.log("CSV fetch error: ", err)
);
const result_fields_csv = csv(result_fields).catch((err) =>
  console.log("CSV fetch error: ", err)
);
const result_groups_csv = csv(result_groups).catch((err) =>
  console.log("CSV fetch error: ", err)
);

export { field_manifest_csv, goals_csv, result_fields_csv, result_groups_csv };
