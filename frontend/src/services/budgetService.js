import api from "./api.js";

export async function getCurrentBudget() {
  const response = await api.get("/budgets/current");
  return response.data;
}

export async function setBudget(data) {
  const response = await api.post("/budgets", data);
  return response.data;
}
