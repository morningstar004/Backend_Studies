const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(
  /\/$/,
  "",
);

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      // Tells the browser to send cookies (e.g., session/auth cookies) even for cross-origin requests, which is needed for cookie-based authentication.
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check your connection and try again.",
        { cause: error },
      );
    }
    throw error;
  }

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
