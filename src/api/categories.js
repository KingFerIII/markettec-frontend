// src/api/categories.js
import api from "./client";

// 1. Obtener lista de categorías
export async function listCategories() {
  const response = await api.get("/categories/");
  return response.data; // [ { id, name, description, image }, ... ]
}

// 2. Crear categoría (nombre + descripción + imagen)
export async function createCategory({ name, description, imageFile }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description || "");

  if (imageFile) {
    // El backend espera "image" como string, pero casi siempre
    // DRF acepta archivo aquí si es ImageField. Lo mandamos como file.
    formData.append("image", imageFile);
  }

  const response = await api.post("/categories/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// 3. Actualizar categoría existente
export async function updateCategory(id, { name, description, imageFile }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await api.put(`/categories/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// 4. Eliminar categoría
export async function deleteCategory(id) {
  return api.delete(`/categories/${id}/`);
}
