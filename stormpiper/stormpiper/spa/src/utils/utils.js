import { rgb } from "d3-color";

export let Authorization = null;
export let urlPrefix = "";

if (import.meta.env.MODE === "development") {
  urlPrefix = import.meta.env?.VITE_API_FETCH_PREFIX ?? "";

  if (import.meta.env?.VITE_AUTH_TOKEN) {
    Authorization = `Bearer ${import.meta.env?.VITE_AUTH_TOKEN}`;
    console.log("set access token with .env");
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
      console.log("set access token with login credentials");
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

  console.log(response.status, window.location.pathname);
  if (response.status === 401 && window.location.pathname !== "/app") {
    window.location.replace(`${urlPrefix}/app`);
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
  if (params.field.toLowerCase() === "tmnt_facility_count") {
    console.log("asf");
  }
  const n = Number(parseFloat(params.value).toPrecision(3));
  return `${n}`;
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

export const createDisplayName = (str) => {
  const units = ["pct", "lbs", "mg/l", "inches", "cuft"];

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
    const substring2 = str.substring(targetIndex).replaceAll("_", " "); // e.g. "(mg/l)"
    return `${substring1} (${substring2})`;
  }

  return [str];
};
