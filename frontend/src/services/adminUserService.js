import api from "../api";

export async function listAdminUsers() {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function createAdminUser(payload) {
  const response = await api.post("/admin/users", payload);
  return response.data;
}

export async function deactivateAdminUser(userId) {
  await api.delete(`/admin/users/${userId}`);
}

export async function resetAdminUserPassword(userId, newPassword) {
  await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
}
