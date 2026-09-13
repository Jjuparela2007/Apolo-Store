import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Adjunta el token del cliente (si hay sesión iniciada) a cada petición.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("apolo_customer_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expiró o es inválido, limpia la sesión local y manda al cliente a
// iniciar sesión de nuevo con un aviso — en vez de dejar la página en un estado
// silencioso donde las siguientes acciones fallarían sin explicación.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("apolo_customer_token");
      localStorage.removeItem("apolo_customer_data");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(err);
  }
);

export default client;