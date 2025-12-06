import api from "./client";

// 1. Obtener todas las categorías
export const getCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

// 2. Crear una categoría (Soporta Imagen)
// Recibe un objeto 'categoryData' que puede ser JSON o FormData
// Si tu backend espera 'multipart/form-data', lo ideal es mandar FormData desde la vista.
export const createCategory = async (categoryData) => {
  const response = await api.post("/categories/", categoryData, {
    headers: {
      // Si mandamos FormData, axios suele ajustar el Content-Type automáticamente,
      // pero es bueno asegurarse que el backend lo reciba como multipart si lleva foto.
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 3. Editar categoría (Soporta Imagen y cambio de Nombre)
export const updateCategory = async (id, categoryData) => {
  // Usamos .patch para actualizar parcialmente (ej. solo el nombre o solo la foto)
  // o .put si el backend requiere enviar todo el objeto. Usualmente PATCH es más seguro para archivos.
  const response = await api.patch(`/categories/${id}/`, categoryData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 4. Eliminar categoría
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}/`);
  return response.data;
};