import axios from "axios";

// Ajustamos la URL base para que incluya "/api"
// Así las peticiones irán a http://127.0.0.1:8000/api/...
const client = axios.create({
  baseURL: (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000/api").replace(/\/$/, ""),
});

// Interceptor para agregar el Token automáticamente
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = token; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;