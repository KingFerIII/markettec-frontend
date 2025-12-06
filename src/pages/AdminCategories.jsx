// src/pages/AdminCategories.jsx
import { useEffect, useState } from "react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

// Asegura que la URL no termine en slash doble si la env concatenada lo tiene
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://172.200.235.24/api").replace(/\/$/, "");

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del formulario
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null); // El archivo nuevo seleccionado
  const [previewImage, setPreviewImage] = useState(null); // URL para mostrar

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

  // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    // Usamos FormData para empaquetar texto + archivo
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    // Solo agregamos la imagen si el usuario seleccionó una nueva.
    if (imageFile) {
      // OJO: "image" debe coincidir con el nombre del campo en tu modelo Django
      formData.append("image", imageFile);
    }

    try {
      if (editingCategory) {
        // EDITAR
        await updateCategory(editingCategory.id, formData);
        alert("Categoría actualizada correctamente.");
      } else {
        // CREAR
        await createCategory(formData);
        alert("Categoría creada correctamente.");
      }

      resetForm();
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la categoría. Revisa la consola.");
    }
  };
  // ---------------------------------

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setName(category.name || "");
    setDescription(category.description || "");
    setImageFile(null); // Reseteamos el archivo nuevo
    // Mostramos la imagen actual que viene del backend
    setPreviewImage(category.image ? buildImageUrl(category.image) : null);
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

      if (editingCategory && editingCategory.id === category.id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la categoría. Revisa la consola.");
    }
  };

  const handleImageChange = (e) => {
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
      <h1>Gestión de Categorías</h1>

      {/* FORMULARIO */}
      <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <h2>{editingCategory ? "Editar categoría" : "Crear nueva categoría"}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          
          <label>
            <strong>Nombre:</strong>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>

          <label>
            <strong>Descripción:</strong>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>

          <label>
            <strong>Imagen:</strong>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', marginTop: '5px' }}
            />
          </label>

          {/* Previsualización */}
          {previewImage && (
            <div style={{ border: '1px dashed #ccc', padding: '10px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666' }}>Vista previa:</p>
              <img
                src={previewImage}
                alt="Vista previa"
                style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              {editingCategory ? "Guardar cambios" : "Crear categoría"}
            </button>

            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* LISTA */}
      <section>
        <h2>Lista de Categorías</h2>
        {categories.length === 0 && <p>No hay categorías registradas.</p>}

        {categories.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#eee" }}>
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
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>Sin imagen</span>
                    )}
                  </td>
                  <td style={td}><strong>{category.name}</strong></td>
                  <td style={td}>{category.description}</td>
                  <td style={td}>
                    <button onClick={() => handleEditClick(category)} style={{ marginRight: "5px", cursor: 'pointer' }}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDeleteClick(category)} style={{ color: "red", cursor: 'pointer' }}>
                      🗑️ Eliminar
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

const th = { border: "1px solid #ddd", padding: "10px", textAlign: "left" };
const td = { border: "1px solid #ddd", padding: "10px", verticalAlign: "middle" };

function buildImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default AdminCategories;