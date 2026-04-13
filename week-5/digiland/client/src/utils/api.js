// ── Axios API Instance ────────────────────────────────────────
// Centralized HTTP client with auth token injection
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("digiland_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally - clear session and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("digiland_token");
      localStorage.removeItem("digiland_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ────────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post("/auth/signup", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
};

// ── Property Endpoints ────────────────────────────────────────
export const propertyAPI = {
  getAll: (params) => API.get("/properties", { params }),
  getById: (id) => API.get(`/properties/${id}`),
  add: (data) => API.post("/properties", data),
  verify: (id) => API.post(`/properties/${id}/verify`),
  getStats: () => API.get("/properties/stats/summary"),
};

export default API;
