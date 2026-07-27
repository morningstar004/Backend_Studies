const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const responseData = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(responseData?.message || 'API request failed');
  }
  return responseData;
};

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
