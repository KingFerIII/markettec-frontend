// src/api/reports.js
import api from "./client";

// Obtiene la lista de reportes para el administrador
export async function getReports() {
  // IMPORTANTE:
  // Si en Swagger el endpoint se llama diferente (por ejemplo /report/ o /reports/list/),
  // cambia "/reports/" por la ruta correcta.
  const response = await api.get("/reports/");
  return response.data;
}
