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

  return await fetch(resource, args);
}

export function colorToList(specifier, alpha) {
  const { r, g, b, opacity } = rgb(specifier);
  const op = Math.ceil(255 * (alpha || opacity));
  return [r, g, b, op];
}

export function pick(obj, ...args) {
  return { ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {}) };
}
