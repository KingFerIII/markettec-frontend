// src/pages/AdminCategories.jsx
import { useEffect, useState } from "react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // estado del formulario
  const [editingCategory, setEditingCategory] = useState(null); // null = creando
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const loadCategories = () => {
    setLoading(true);
    listCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error cargando categorías:", err);
        setError("No se pudieron cargar las categorías");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      if (editingCategory) {
        // EDITAR
        await updateCategory(editingCategory.id, {
          name,
          description,
          imageFile,
        });
        alert("Categoría actualizada correctamente.");
      } else {
        // CREAR
        await createCategory({
          name,
          description,
          imageFile,
        });
        alert("Categoría creada correctamente.");
      }

      resetForm();
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la categoría. Revisa la consola.");
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setName(category.name || "");
    setDescription(category.description || "");
    setImageFile(null);
    setPreviewImage(
      category.image ? buildImageUrl(category.image) : null
    );
  };

  const handleDeleteClick = async (category) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la categoría "${category.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      alert("Categoría eliminada.");
      loadCategories();

      // si estabas editando esta categoría, limpia el formulario
      if (editingCategory && editingCategory.id === category.id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la categoría. Revisa la consola.");
    }
  };

  const handleImageChange = (e) => {
    // Versión compatible sin optional chaining
    const file = e.target.files && e.target.files[0];
    setImageFile(file || null);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Categorías</h1>

      {/* FORMULARIO CREA / EDITA */}
      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <h2>{editingCategory ? "Editar categoría" : "Crear nueva categoría"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Nombre:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginLeft: "0.5rem", width: "250px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Descripción:
              <br />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: "100%", maxWidth: "400px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Imagen:
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
          </div>

          {previewImage && (
            <div style={{ marginBottom: "0.5rem" }}>
              <p>Vista previa:</p>
              <img
                src={previewImage}
                alt="Vista previa"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
            </div>
          )}

          <button type="submit">
            {editingCategory ? "Guardar cambios" : "Crear categoría"}
          </button>

          {editingCategory && (
            <button
              type="button"
              onClick={resetForm}
              style={{ marginLeft: "0.5rem" }}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </section>

      {/* LISTA DE CATEGORÍAS */}
      <section>
        <h2>Categorías existentes</h2>

        {categories.length === 0 && <p>No hay categorías registradas.</p>}

        {categories.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
            }}
          >
            <thead>
              <tr>
                <th style={th}>Imagen</th>
                <th style={th}>Nombre</th>
                <th style={th}>Descripción</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td style={td}>
                    {category.image ? (
                      <img
                        src={buildImageUrl(category.image)}
                        alt={category.name}
                        style={{ width: 80, height: 80, objectFit: "cover" }}
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                  <td style={td}>{category.name}</td>
                  <td style={td}>{category.description}</td>
                  <td style={td}>
                    <button onClick={() => handleEditClick(category)}>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      style={{ marginLeft: "0.5rem" }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const th = { border: "1px solid #ccc", padding: "0.5rem" };
const td = { border: "1px solid #ccc", padding: "0.5rem", verticalAlign: "top" };

function buildImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path}`;
}

export default AdminCategories;
