import React, { useState, useEffect } from 'react';
import client from '../api/client'; // <--- IMPORTANTE: Usamos el cliente, no axios

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar usuarios
  const fetchUsers = () => {
    setLoading(true);
    // Usamos client.get. Ya sabe la IP y ya tiene el Token.
    // Solo ponemos la ruta final: '/users/'
    client.get('/users/') 
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

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Funciones de Acción (Actualizadas con client) ---

  const handleDeleteUser = (userId, username) => {
    if (userId === 1) return alert("No puedes borrar al superusuario.");
    if (!window.confirm(`¿Borrar a '${username}'?`)) return;
    
    client.delete(`/users/${userId}/`)
      .then(() => fetchUsers())
      .catch(err => alert("Error al borrar usuario."));
  };

  const handleChangeRole = (userId, newRole) => {
    client.patch(`/users/${userId}/`, { profile: { role: newRole } })
      .then(() => fetchUsers())
      .catch(err => alert("Error al cambiar el rol."));
  };

  const handleBanUser = (userId, username) => {
    const reason = window.prompt(`Razón para banear a '${username}':`);
    if (!reason) return;

    client.post(`/users/${userId}/ban_user/`, { reason: reason })
      .then(() => fetchUsers())
      .catch(err => alert("Error al banear."));
  };

  const handleUnbanUser = (userId, username) => {
    client.post(`/users/${userId}/unban_user/`, {})
      .then(() => fetchUsers())
      .catch(err => alert("Error al desbanear."));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Gestionar Usuarios</h2>
      
      {loading && <p>Cargando...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{background: '#eee', textAlign: 'left'}}>
              <th style={{padding: '10px'}}>ID</th>
              <th style={{padding: '10px'}}>Usuario</th>
              <th style={{padding: '10px'}}>Email</th>
              <th style={{padding: '10px'}}>Rol</th>
              <th style={{padding: '10px'}}>Estado</th>
              <th style={{padding: '10px'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '10px'}}>{user.id}</td>
                <td style={{padding: '10px'}}>{user.username}</td>
                <td style={{padding: '10px'}}>{user.email}</td>
                <td style={{padding: '10px'}}>{user.profile?.role || 'N/A'}</td>
                <td style={{padding: '10px', color: user.profile?.is_banned ? 'red' : 'green'}}>
                    {user.profile?.is_banned ? 'Baneado' : 'Activo'}
                </td>
                <td style={{padding: '10px'}}>
                  {/* Botones simplificados */}
                  <button onClick={() => handleDeleteUser(user.id, user.username)}>🗑️</button>
                  {!user.profile?.is_banned ? (
                      <button onClick={() => handleBanUser(user.id, user.username)} style={{marginLeft: 5}}>🚫</button>
                  ) : (
                      <button onClick={() => handleUnbanUser(user.id, user.username)} style={{marginLeft: 5}}>✅</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageUsers;