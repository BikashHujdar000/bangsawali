import api from "../api";

export async function listTransactions() {
  const response = await api.get("/transactions");
  return response.data;
}

export async function createTransaction(payload) {
  const response = await api.post("/transactions", payload);
  return response.data;
}
