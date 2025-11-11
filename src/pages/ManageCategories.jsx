// En: src/pages/ManageCategories.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Nuevo estado para el formulario de "Crear Categoría"
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // 1. Función para cargar las categorías
  const fetchCategories = () => {
    setLoading(true);
    // GET /api/categories/ es público, no necesita token
    axios.get(`${API_URL}/api/categories/`)
      .then(response => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar categorías:", err);
        setError("No se pudieron cargar las categorías.");
        setLoading(false);
      });
  };

  // 2. Cargar las categorías al montar la página
  useEffect(() => {
    fetchCategories();
  }, []); // El '[]' vacío significa "corre esto solo una vez"

  // 3. Función para CREAR una nueva categoría
  const handleCreate = (e) => {
    e.preventDefault(); // Evita que el formulario recargue
    const token = localStorage.getItem('adminToken'); // Token de Admin

    axios.post(`${API_URL}/api/categories/`, 
      {
        name: newCategoryName,
        description: newCategoryDesc
      },
      {
        headers: { 'Authorization': token }
      }
    )
    .then(response => {
      // Si funciona, limpiamos el formulario y recargamos la lista
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchCategories(); // Volvemos a cargar la lista para ver la nueva
    })
    .catch(err => {
      console.error("Error al crear categoría:", err);
      alert("Error al crear la categoría.");
    });
  };

  // 4. Función para BORRAR una categoría
  const handleDelete = (categoryId) => {
    // Pedimos confirmación
    if (!window.confirm("¿Estás seguro de que quieres borrar esta categoría?")) {
      return;
    }

    const token = localStorage.getItem('adminToken'); // Token de Admin

    axios.delete(`${API_URL}/api/categories/${categoryId}/`, {
      headers: { 'Authorization': token }
    })
    .then(response => {
      // Si funciona, recargamos la lista
      fetchCategories();
    })
    .catch(err => {
      console.error("Error al borrar categoría:", err);
      alert("Error al borrar la categoría.");
    });
  };

  return (
    <div>
      <h2>Gestionar Categorías</h2>
      
      {/* --- Formulario de Creación (con nueva clase) --- */}
      <form onSubmit={handleCreate} className="manage-categories-form">
        <h3>Crear Nueva Categoría</h3>
        <div>
          <label>Nombre:</label>
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Descripción:</label>
          <input 
            type="text" 
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />
        </div>
        <button type="submit">Crear</button>
      </form>

      {/* --- Lista de Categorías Existentes --- */}
      <h3>Categorías Existentes</h3>
      {loading && <p>Cargando categorías...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <table> {/* Las tablas ya tienen estilo global */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <button 
                  onClick={() => handleDelete(category.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCategories;