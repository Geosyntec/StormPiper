// import { Authorization } from "./_no_git_auth";
// let Authorization = "";

let Authorization = null;
export let urlPrefix = "";

if (import.meta.env.MODE === "development") {
  if (import.meta.env?.VITE_AUTH_TOKEN) {
    Authorization = `Bearer ${import.meta.env?.VITE_AUTH_TOKEN}`;
  }
  urlPrefix = import.meta.env?.VITE_API_FETCH_PREFIX ?? "";
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

