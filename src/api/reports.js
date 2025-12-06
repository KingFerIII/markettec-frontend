import client from "./client";

// NOTA: Como en client.js ya pusimos "/api", aquí solo ponemos la ruta final.

// 1. Obtener lista
export const getReports = async () => {
  const response = await client.get("/reports/");
  return response.data;
};

// 2. Obtener detalles
export const getReportDetails = async (id) => {
  const response = await client.get(`/reports/${id}/`);
  return response.data;
};

// 3. Banear Usuario (La función que faltaba)
export const banUser = async (userId, reason) => {
  const response = await client.post(`/users/${userId}/ban_user/`, { 
    reason: reason 
  });
  return response.data;
};

// 4. Marcar como atendido
export const updateReportStatus = async (reportId, status, feedback) => {
  const response = await client.patch(`/reports/${reportId}/`, {
    status: status,
    admin_feedback: feedback
  });
  return response.data;
};