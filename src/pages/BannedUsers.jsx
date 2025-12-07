import React, { useState, useEffect } from 'react';
import client from '../api/client'; // <--- Usamos el cliente configurado

function BannedUsers() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar usuarios baneados
  const fetchBannedUsers = () => {
    setLoading(true);
    
    // Usamos client.get. El token se pone solo.
    // La ruta es relativa a /api, así que solo ponemos la parte final.
    client.get('/users/banned_users/')
      .then(response => {
        setBannedUsers(response.data); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar usuarios baneados:", err);
        setError("No se pudieron cargar los usuarios baneados.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBannedUsers();
  }, []);

  // 2. Desbanear
  const handleUnbanUser = (userId, username) => {
    if(!window.confirm(`¿Desbanear a ${username}?`)) return;

    client.post(`/users/${userId}/unban_user/`, {})
      .then(() => {
        alert("Usuario desbaneado.");
        fetchBannedUsers(); // Recargar lista
      })
      .catch(err => alert("Error al desbanear al usuario."));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Usuarios Baneados</h2>
      <p>Esta es la lista de todos los usuarios que actualmente tienen el acceso bloqueado.</p>
      
      {loading && <p>Cargando usuarios...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{background: '#eee', textAlign: 'left'}}>
              <th style={{padding: '10px'}}>ID</th>
              <th style={{padding: '10px'}}>Usuario</th>
              <th style={{padding: '10px'}}>Correo</th>
              <th style={{padding: '10px'}}>Rol</th>
              <th style={{padding: '10px'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bannedUsers.map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '10px'}}>{user.id}</td>
                <td style={{padding: '10px'}}>{user.username}</td>
                <td style={{padding: '10px'}}>{user.email}</td>
                <td style={{padding: '10px'}}>{user.profile?.role || 'N/A'}</td>
                <td style={{padding: '10px'}}>
                  <button 
                    style={{ background: '#5bc0de', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => handleUnbanUser(user.id, user.username)}
                  >
                    Desbanear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && bannedUsers.length === 0 && (
        <p style={{marginTop: '20px', fontStyle: 'italic'}}>No hay usuarios baneados actualmente.</p>
      )}
    </div>
  );
}

export default BannedUsers;