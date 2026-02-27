const buildHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

const request = async ({ baseUrl, token, path, method = "GET", body }) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined
  });

  return parseResponse(response);
};

export const api = {
  createTask: ({ baseUrl, token, title, description }) =>
    request({
      baseUrl,
      token,
      path: "/tasks",
      method: "POST",
      body: { title, description }
    }),

  listTasks: ({ baseUrl, token }) =>
    request({ baseUrl, token, path: "/tasks" }),

  listMyTasks: ({ baseUrl, token }) =>
    request({ baseUrl, token, path: "/tasks/mine" }),

  listUsers: ({ baseUrl, token }) =>
    request({ baseUrl, token, path: "/users" }),

  getTask: ({ baseUrl, token, taskId }) =>
    request({
      baseUrl,
      token,
      path: `/tasks/${taskId}`
    }),

  updateTask: ({ baseUrl, token, taskId, status }) =>
    request({
      baseUrl,
      token,
      path: `/tasks/${taskId}`,
      method: "PUT",
      body: { status }
    }),

  assignTask: ({ baseUrl, token, taskId, assignedTo }) =>
    request({
      baseUrl,
      token,
      path: `/tasks/assign/${taskId}`,
      method: "POST",
      body: { assignedTo }
    }),

  deleteTask: ({ baseUrl, token, taskId }) =>
    request({
      baseUrl,
      token,
      path: `/tasks/${taskId}`,
      method: "DELETE"
    })
};
