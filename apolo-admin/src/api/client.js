import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("apolo_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("apolo_admin_token");
      localStorage.removeItem("apolo_admin_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(err);
  }
);

export default client;