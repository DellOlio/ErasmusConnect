export async function login(email, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password: password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Pogresan email ili lozinka");
  }

  return response.json();
}

export async function register(name, email, password) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, email: email, password: password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Registracija nije uspjela");
  }

  return response.json();
}

export async function getMyProfile() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users/me", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function updateMyProfile(data) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function uploadAvatar(file) {
  const token = localStorage.getItem("token");
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/users/me/avatar", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function getUser(userId) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users/" + userId, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function getCities() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users/cities", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function lockCity() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users/me/lock-city", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function unlockCity() {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users/me/unlock-city", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function getPosts(city) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/posts?city=" + encodeURIComponent(city), {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function createPost(content, city, image) {
  const token = localStorage.getItem("token");
  const form = new FormData();
  form.append("content", content);
  form.append("city", city);
  if (image) {
    form.append("image", image);
  }

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function toggleLike(postId) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/posts/" + postId + "/like", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function getComments(postId) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/posts/" + postId + "/comments", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function addComment(postId, content) {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/posts/" + postId + "/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ content: content }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}

export async function searchUsers(name, country, city) {
  const token = localStorage.getItem("token");
  let url = "/api/search/users?";
  if (name) url += "q=" + encodeURIComponent(name) + "&";
  if (country) url += "country=" + encodeURIComponent(country) + "&";
  if (city) url += "city=" + encodeURIComponent(city) + "&";

  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Greska");
  }

  return response.json();
}
