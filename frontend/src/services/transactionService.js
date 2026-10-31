import api from "./api.js";

export async function getSummary() {
  const response = await api.get("/transactions/summary");
  return response.data;
}

export async function getTransactions(page = 0, size = 20, type, categoryId) {
  const response = await api.get("/transactions", {
    params: {
      page,
      size,
      ...(type && type !== "ALL" ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
  });
  return response.data;
}

export async function createTransaction(data) {
  const response = await api.post("/transactions", data);
  return response.data;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`);
}
