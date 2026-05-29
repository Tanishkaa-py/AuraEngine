import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15_000,
});

// ─── Inventory ─────────────────────────────────────────────────────────────────
export const fetchInventory = (params) => api.get("/inventory", { params });
export const fetchProduct   = (id)     => api.get(`/inventory/${id}`);
export const createProduct  = (data)   => api.post("/inventory", data);
export const updateProduct  = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteProduct  = (id)     => api.delete(`/inventory/${id}`);

// ─── Analytics ─────────────────────────────────────────────────────────────────
export const fetchAnalytics  = ()  => api.get("/analytics");
export const fetchCategories = ()  => api.get("/analytics/categories");
