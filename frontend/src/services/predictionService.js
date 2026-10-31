import api from "./api.js";

export async function getPrediction(months = 6) {
  const response = await api.get("/predictions/next-month", {
    params: { months },
  });
  return response.data;
}
