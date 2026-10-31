import api from "./api.js";

export async function getCategories() {
  const response = await api.get("/categories");
  return response.data;
}

export async function createCategory(data) {
  const response = await api.post("/categories", data);
  return response.data;
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}
