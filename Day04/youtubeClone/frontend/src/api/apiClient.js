const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
  /\/$/,
  "",
);

let csrfToken;
let csrfTokenRequest;

const readResponse = async (response) => {
  const responseText = await response.text();
  let responseData = null;
  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch {
    // Some server/proxy errors are not JSON; use the HTTP status below instead.
  }

  if (!response.ok) {
    const message =
      responseData?.message ||
      responseData?.error ||
      (responseText && !responseText.trimStart().startsWith("<")
        ? responseText.trim()
        : null) ||
      `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return responseData;
};

const fetchWithCredentials = async (url, options) => {
  try {
    return await fetch(url, { ...options, credentials: "include" });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check your connection and try again.",
        { cause: error },
      );
    }
    throw error;
  }
};

const getCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  if (!csrfTokenRequest) {
    csrfTokenRequest = fetchWithCredentials(`${BASE_URL}/csrf-token`, {
      method: "GET",
    })
      .then(readResponse)
      .then((responseData) => {
        const issuedToken = responseData?.data?.csrfToken;
        if (typeof issuedToken !== "string" || !issuedToken) {
          throw new Error("The server did not issue a CSRF token.");
        }
        csrfToken = issuedToken;
        return csrfToken;
      })
      .finally(() => {
        csrfTokenRequest = null;
      });
  }

  return csrfTokenRequest;
};

const request = async (path, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers["X-CSRF-Token"] = await getCsrfToken();
  }

  let response;
  response = await fetchWithCredentials(`${BASE_URL}${path}`, {
    ...options,
    method,
    headers,
  });
  return readResponse(response);
};

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  patchForm: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
