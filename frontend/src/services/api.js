import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("mudgarvale_auth");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

// ---- Auth ----
export const signupUser = (payload) => api.post("/auth/signup", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const fetchMe = () => api.get("/auth/me");

// ---- Products ----
export const fetchCategories = () => api.get("/products/categories");
export const fetchProductsByCategory = (category) =>
  api.get(`/products?category=${encodeURIComponent(category)}`);

// ---- Sales ----
export const createSale = (payload) => api.post("/sales", payload);
export const fetchSales = (params = {}) => api.get("/sales", { params });
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// ---- Admin: Employees ----
export const fetchEmployeesWithStats = () => api.get("/employees");
export const toggleEmployeeVerify = (id) => api.patch(`/employees/${id}/verify`);
export const toggleEmployeeActive = (id) => api.patch(`/employees/${id}/active`);
export const updateEmployee = (id, payload) => api.put(`/employees/${id}`, payload);

export default api;