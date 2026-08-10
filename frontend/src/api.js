const API = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    const detail = err.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail || "Request failed";
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (data) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  login: async (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  getMe: () => request("/users/me"),
  updateMe: (data) =>
    request("/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/users/me/avatar", { method: "POST", body: form });
  },
  getUser: (id) => request(`/users/${id}`),

  getPosts: () => request("/posts"),
  createPost: (content, image) => {
    const form = new FormData();
    form.append("content", content);
    if (image) form.append("image", image);
    return request("/posts", { method: "POST", body: form });
  },
  toggleLike: (postId) => request(`/posts/${postId}/like`, { method: "POST" }),
  getComments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, content) =>
    request(`/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }),

  searchUsers: (params) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.country) qs.set("country", params.country);
    if (params.city) qs.set("city", params.city);
    return request(`/search/users?${qs}`);
  },
};

export function logout() {
  localStorage.removeItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function isLoggedIn() {
  return !!getToken();
}
