// En: src/pages/BannedUsers.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function BannedUsers() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Función para cargar (o recargar) los usuarios baneados
  const fetchBannedUsers = () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    // Llamamos al nuevo endpoint de la API
    axios.get(`${API_URL}/api/users/banned_users/`, {
      headers: { 'Authorization': token }
    })
    .then(response => {
      // Este endpoint (como /api/users/) devuelve una lista simple
      setBannedUsers(response.data); 
      setLoading(false);
    })
    .catch(err => {
      console.error("Error al cargar usuarios baneados:", err);
      setError("No se pudieron cargar los usuarios baneados.");
      setLoading(false);
    });
  };

  // 2. Cargar los usuarios al montar la página
  useEffect(() => {
    fetchBannedUsers();
  }, []); // El '[]' vacío significa "corre esto solo una vez"

  // 3. Función para DESBANEAR (la misma de ManageUsers)
  const handleUnbanUser = (userId, username) => {
    const token = localStorage.getItem('adminToken');
    
    axios.post(`${API_URL}/api/users/${userId}/unban_user/`, {}, {
      headers: { 'Authorization': token }
    })
    .then(() => {
      // Si funciona, recargamos la lista de baneados (el usuario desaparecerá de aquí)
      fetchBannedUsers(); 
    })
    .catch(err => alert("Error al desbanear al usuario."));
  };

  return (
    <div>
      <h2>Usuarios Baneados</h2>
      <p>Esta es la lista de todos los usuarios que actualmente tienen el acceso bloqueado.</p>
      
      {loading && <p>Cargando usuarios...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        
        <tbody>
          {bannedUsers.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.profile?.role || 'N/A'}</td>
              <td>
                <button 
                  style={{ background: '#5bc0de', color: 'white' }}
                  onClick={() => handleUnbanUser(user.id, user.username)}
                >
                  Desbanear
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && bannedUsers.length === 0 && (
        <p>No hay usuarios baneados actualmente.</p>
      )}
    </div>
  );
}

export default BannedUsers;