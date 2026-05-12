import api from "../api";

export async function listDistricts() {
  const response = await api.get("/districts");
  return response.data;
}
