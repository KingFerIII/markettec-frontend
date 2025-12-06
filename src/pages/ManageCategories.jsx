// En: src/pages/ManageCategories.jsx
import React, { useState, useEffect } from 'react';
import client from '../api/client';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://172.200.235.24:8000").replace(/\/$/, "");

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del formulario
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    client.get('/categories/')
      .then(response => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setError("No se pudieron cargar las categorías.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setImageFile(file || null);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setImageFile(null);
    setPreviewImage(category.image ? buildImageUrl(category.image) : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editingCategory) {
        await client.patch(`/categories/${editingCategory.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Categoría actualizada.");
      } else {
        await client.post('/categories/', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Categoría creada.");
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      alert("Error al guardar. Revisa los datos.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Borrar categoría?")) return;
    try {
      await client.delete(`/categories/${id}/`);
      fetchCategories();
    } catch (err) {
      alert("Error al borrar.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}> {/* Container simple */}
      <h2>Gestionar Categorías</h2>
      <p style={{marginBottom: '2rem', color: 'var(--text-light)'}}>Administra las categorías de tus productos.</p>

      {/* --- TARJETA FORMULARIO --- */}
      <div className="card">
        <div className="card-header">
          <h3>{editingCategory ? `✏️ Editando: ${editingCategory.name}` : "➕ Nueva Categoría"}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label>Nombre</label>
            <input 
                type="text" 
                className="form-control"
                placeholder="Ej. Electrónica" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
            />
          </div>
          
          <div className="form-group">
            <label>Descripción</label>
            <textarea 
                className="form-control"
                placeholder="Breve descripción..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows="3"
            />
          </div>

          <div className="form-group">
            <label>Imagen</label>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
            />
            {previewImage && (
                <div className="preview-container">
                    <img src={previewImage} alt="Preview" className="preview-img" />
                    <div style={{fontSize: '0.8rem', color: '#666'}}>Vista previa</div>
                </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" style={{ backgroundColor: "var(--primary-blue)", color: "white" }}>
                {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </button>
            
            {editingCategory && (
                <button type="button" onClick={resetForm} style={{ backgroundColor: "var(--info-gray)", color: "white" }}>
                    Cancelar
                </button>
            )}
          </div>
        </form>
      </div>

      {/* --- TABLA --- */}
      {loading && <p>Cargando...</p>}
      
      {!loading && (
        <div className="card"> {/* Reusamos el estilo card para la tabla */}
            <table>
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <tr key={cat.id}>
                            <td>
                                {cat.image ? (
                                    <img src={buildImageUrl(cat.image)} alt={cat.name} className="table-img" />
                                ) : (
                                    <div className="no-img-box">Sin foto</div>
                                )}
                            </td>
                            <td><strong>{cat.name}</strong></td>
                            <td>{cat.description}</td>
                            <td>
                                <button onClick={() => handleEditClick(cat)} className="btn-icon" title="Editar">✏️</button>
                                <button onClick={() => handleDelete(cat.id)} className="btn-icon" style={{color: 'var(--danger-red)', borderColor: 'var(--danger-red)'}} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {categories.length === 0 && <p style={{padding: '20px', textAlign: 'center'}}>No hay categorías.</p>}
        </div>
      )}
    </div>
  );
}

function buildImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default ManageCategories;