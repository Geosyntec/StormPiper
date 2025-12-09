import { rgb } from "d3-color";

export let Authorization = null;
export let urlPrefix = "";

if (import.meta.env.MODE === "development") {
  urlPrefix = import.meta.env?.VITE_API_FETCH_PREFIX ?? "";

  if (import.meta.env?.VITE_AUTH_TOKEN) {
    Authorization = `Bearer ${import.meta.env?.VITE_AUTH_TOKEN}`;
  } else if (
    import.meta.env?.VITE_LOGIN_ACCOUNT_EMAIL &&
    import.meta.env?.VITE_LOGIN_ACCOUNT_PASSWORD
  ) {
    const response = await fetch(`${urlPrefix}/auth/jwt-bearer/login`, {
      method: "POST",
      body: new URLSearchParams({
        username: import.meta.env.VITE_LOGIN_ACCOUNT_EMAIL,
        password: import.meta.env.VITE_LOGIN_ACCOUNT_PASSWORD,
      }),
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      Authorization = `Bearer ${data.access_token}`;
    }
  }
}

export async function api_fetch(resource, args = {}) {
  if (typeof resource === "string" || resource instanceof String) {
    resource = `${urlPrefix}${resource}`;
  }

  const { headers } = args;
  if (headers?.Authorization == null && Authorization) {
    args = { ...args, headers: { ...headers, Authorization } };
  }

  const response = await fetch(resource, args);

  if (response.status === 401 && window.location.pathname !== "/app") {
    window.location.replace(`${urlPrefix}/app`);
  }
  if (response.status > 401) {
    console.debug(await response.clone().text());
  }

  return response;
}

export function colorToList(specifier, alpha) {
  const { r, g, b, opacity } = rgb(specifier);
  const op = Math.ceil(255 * (alpha ?? opacity));
  return [r, g, b, op];
}

export function pick(obj, ...args) {
  return { ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {}) };
}

export function dateFormatter(dtValue) {
  if (dtValue == null) {
    return "--";
  }
  const valueDate = new Date(dtValue.replace(" ", "T"));
  const valueLocale = valueDate.toLocaleString("en-US", {
    timeZoneName: "short",
  });
  const [date, time, ..._] = valueLocale.split(",");
  return `${date.trim()} at ${time.trim()}`;
}

export const concFormatter = (params) => {
  if (params.value == null) {
    return "0";
  }
  const n = Number(parseFloat(params.value).toPrecision(3));
  const units = params.id.split("-").pop();
  return `${n} ${units}`;
};

export const numFormatter = (params) => {
  if (params.value == null) {
    return "0";
  }
  const n = Number(parseFloat(params.value).toPrecision(3));
  return `${n.toLocaleString("en-US")}`;
};

export const pctFormatter = (params) => {
  if (params.value == null) {
    return "--";
  }
  const n = parseFloat(params.value).toFixed(1);
  return `${n}%`;
};

export const strFormatter = (params) => {
  if (!params.value) {
    return " ";
  }
  return params.value.replace("_simple", "").replaceAll("_", " ");
};

export const toValidHtmlId = (str) => {
  // Convert to lowercase
  let validId = String(str).toLowerCase();

  // Replace any characters not allowed in an HTML ID with a hyphen
  // (except for letters, numbers, hyphens, and underscores)
  validId = validId.replace(/[^a-z0-9-_]/g, "-");

  // Remove multiple consecutive hyphens
  validId = validId.replace(/--+/g, "-");

  // Remove leading or trailing hyphens
  validId = validId.replace(/^-+|-+$/g, "");

  // Ensure the ID starts with a letter if it doesn't already
  if (!validId.match(/^[a-z]/)) {
    validId = "id-" + validId;
  }

  return validId;
};

export const createDisplayName = (str) => {
  const units = ["pct", "lbs", "ug/l", "mg/l", "inches", "cuft"];

  let targetIndex = -1;

  for (const target of units) {
    targetIndex = str.indexOf(target);
    if (targetIndex !== -1) {
      break;
    }
  }

  if (targetIndex !== -1) {
    const substring1 = str
      .substring(0, targetIndex)
      .replaceAll("_", " ")
      .replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
      }); // e.g "TSS Conc"
    const substring2 = str
      .substring(targetIndex)
      .replaceAll("_", " ")
      .replace("ug", "µg");
    return `${substring1} (${substring2})`;
  }

  return str;
};

export function exportCSVFile(csv, fileTitle) {
  var exportedFilename = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", exportedFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function convertToCSV(objArray, headers) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  let headersFormatted = {};

  if (headers) {
    headers.map((k) => {
      headersFormatted[k] = k;
    });
    array.unshift(headersFormatted);
  }

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  return str;
}

export function transposeObject(obj) {
  //Takes an JSON-like object, and creates an array of field-value pairs
  let res = [];
  Object.keys(obj).map((k) => {
    res.push({
      field: k,
      value: obj[k],
    });
  });
  return res;
}

export function sortResultsArray(objArray, fieldSet) {
  if (!objArray) {
    return;
  }

  if (!objArray.length) {
    objArray = [objArray];
  }

  const sortedArray = objArray.map((obj) => {
    let res = {};
    fieldSet.forEach((field) => {
      res[field] = obj[field];
    });
    return res;
  });

  return sortedArray;
}
