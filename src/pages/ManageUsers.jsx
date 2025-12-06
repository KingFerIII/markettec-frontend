// En: src/pages/ManageUsers.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://172.200.235.24:8000';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Función para cargar (o recargar) los usuarios
  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    axios.get(`${API_URL}/api/users/`, {
      headers: { 'Authorization': token }
    })
    .then(response => {
      setUsers(response.data); 
      setLoading(false);
    })
    .catch(err => {
      console.error("Error al cargar usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
      setLoading(false);
    });
  };

  // 2. Cargar los usuarios al montar la página
  useEffect(() => {
    fetchUsers();
  }, []); // El '[]' vacío significa "corre esto solo una vez"


  // --- 3. FUNCIÓN PARA BORRAR USUARIO ---
  const handleDeleteUser = (userId, username) => {
    if (userId === 1) {
      alert("No puedes borrar al superusuario principal.");
      return;
    }
    
    if (!window.confirm(`¿Estás seguro de que quieres borrar al usuario '${username}'?`)) {
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    
    axios.delete(`${API_URL}/api/users/${userId}/`, {
      headers: { 'Authorization': token }
    })
    .then(() => {
      fetchUsers(); 
    })
    .catch(err => {
      console.error("Error al borrar usuario:", err);
      alert("Error al borrar usuario.");
    });
  };

  // --- 4. FUNCIÓN PARA CAMBIAR ROL ---
  const handleChangeRole = (userId, newRole) => {
    const token = localStorage.getItem('adminToken');
    
    axios.patch(`${API_URL}/api/users/${userId}/`, 
      {
        profile: {
          role: newRole
        }
      },
      {
        headers: { 'Authorization': token }
      }
    )
    .then(() => {
      fetchUsers(); 
    })
    .catch(err => {
      console.error("Error al cambiar rol:", err);
      alert("Error al cambiar el rol.");
    });
  };

  // --- 5. ¡NUEVA FUNCIÓN PARA BANEAR! ---
  const handleBanUser = (userId, username) => {
    // 1. Preguntamos la razón
    const reason = window.prompt(`Razón para banear al usuario '${username}':`);

    // 2. Si el admin cancela o no escribe nada, detenemos la función.
    if (!reason) {
      alert("El baneo fue cancelado. Se requiere una razón.");
      return;
    }

    const token = localStorage.getItem('adminToken');
    
    // 3. Enviamos la razón en el body de la petición
    axios.post(`${API_URL}/api/users/${userId}/ban_user/`, 
      { reason: reason }, // <-- ¡Enviamos la razón!
      { headers: { 'Authorization': token } }
    )
    .then(() => fetchUsers()) // Recargamos la lista
    .catch(err => {
      const errorMsg = err.response?.data?.error || "Error al banear al usuario.";
      alert(errorMsg);
    });
  };

  // --- 6. ¡NUEVA FUNCIÓN PARA DESBANEAR! ---
  const handleUnbanUser = (userId, username) => {
    const token = localStorage.getItem('adminToken');
    
    // Llamamos al nuevo endpoint de la API
    axios.post(`${API_URL}/api/users/${userId}/unban_user/`, {}, {
      headers: { 'Authorization': token }
    })
    .then(() => fetchUsers()) // Recargamos la lista
    .catch(err => alert("Error al desbanear al usuario."));
  };

  return (
    <div>
      <h2>Gestionar Usuarios</h2>
      
      {loading && <p>Cargando usuarios...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th> {/* <-- ¡NUEVA COLUMNA! */}
            <th>Razón de Baneo</th> {/* <-- ¡NUEVA COLUMNA! */}
            <th>Acciones</th>
          </tr>
        </thead>
        
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {user.profile?.role || 'N/A (Sin Perfil)'}
              </td>
              
              {/* --- ¡NUEVA CELDA DE ESTADO! --- */}
              <td style={{ color: user.profile?.is_banned ? 'red' : 'green', fontWeight: 'bold' }}>
                {user.profile?.is_banned ? 'Baneado' : 'Activo'}
              </td>
              
              {/* --- ¡NUEVA CELDA DE RAZÓN! --- */}
              <td>
                {user.profile?.ban_reason || '---'}
              </td>

              <td style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                
                {/* --- ¡NUEVOS BOTONES DE BANEO! --- */}
                {user.id !== 1 && ( // No puedes banear al superusuario
                  user.profile?.is_banned ? (
                    <button 
                      style={{ background: '#5bc0de', color: 'white' }}
                      onClick={() => handleUnbanUser(user.id, user.username)}
                    >
                      Desbanear
                    </button>
                  ) : (
                    <button 
                      style={{ background: '#f0ad4e', color: 'white' }}
                      onClick={() => handleBanUser(user.id, user.username)}
                    >
                      Banear
                    </button>
                  )
                )}

                {/* --- Tus botones antiguos (mover rol) --- */}
                {user.profile?.role === 'client' && (
                  <button 
                    onClick={() => handleChangeRole(user.id, 'admin')}
                  >
                    Hacer Admin
                  </button>
                )}
                {user.profile?.role === 'admin' && user.id !== 1 && ( 
                  <button 
                    onClick={() => handleChangeRole(user.id, 'client')}
                  >
                    Hacer Cliente
                  </button>
                )}
                
                {/* --- Tu botón de borrar --- */}
                {user.id !== 1 && ( 
                  <button 
                    style={{ marginLeft: '10px' }}
                    onClick={() => handleDeleteUser(user.id, user.username)}
                  >
                    Borrar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;