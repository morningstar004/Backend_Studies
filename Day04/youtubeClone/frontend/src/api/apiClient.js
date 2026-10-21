import { reportBackendReachability } from "../context/networkStatus.js";

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
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return responseData;
};

const fetchWithCredentials = async (url, options) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });
    reportBackendReachability(true);
    return response;
  } catch (error) {
    if (error instanceof TypeError) {
      reportBackendReachability(false);
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

const requestFormWithProgress = async (path, body, onUploadProgress) => {
  const token = await getCsrfToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${path}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("X-CSRF-Token", token);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", async () => {
      if (!xhr.status) {
        reportBackendReachability(false);
        reject(
          new Error(
            "Unable to connect to the server. Please check your connection and try again.",
          ),
        );
        return;
      }

      try {
        reportBackendReachability(true);
        resolve(
          await readResponse(
            new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
            }),
          ),
        );
      } catch (error) {
        reject(error);
      }
    });
    xhr.addEventListener("error", () => {
      reportBackendReachability(false);
      reject(
        new Error(
          "Unable to connect to the server. Please check your connection and try again.",
        ),
      );
    });
    xhr.addEventListener("abort", () => {
      reject(new Error("The upload was canceled."));
    });
    xhr.send(body);
  });
};

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: (path, body) => request(path, { method: "POST", body }),
  postFormWithProgress: (path, body, onUploadProgress) =>
    requestFormWithProgress(path, body, onUploadProgress),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  patchForm: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export const checkApiHealth = async () => {
  const response = await fetchWithCredentials(`${BASE_URL}/health`, {
    method: "GET",
    cache: "no-store",
  });
  reportBackendReachability(response.ok);
  return readResponse(response);
};
