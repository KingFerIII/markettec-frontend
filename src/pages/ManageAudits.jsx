// En: src/pages/ManageAudits.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function ManageAudits() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar la bitácora al montar la página
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    // Llamamos al endpoint de la bitácora
    axios.get(`${API_URL}/api/audits/`, {
      headers: { 'Authorization': token } // Usamos el token guardado
    })
    .then(response => {
      // Este endpoint (como el de Usuarios) devuelve una lista simple
      setLogs(response.data); 
      setLoading(false);
    })
    .catch(err => {
      console.error("Error al cargar la bitácora:", err);
      setError("No se pudo cargar la bitácora de auditoría.");
      setLoading(false);
    });
    
  }, []); // El '[]' vacío significa "corre esto solo una vez"

  return (
    <div>
      <h2>Bitácora de Auditoría</h2>
      <p>Un registro de las acciones importantes que han sucedido en el sistema.</p>
      
      {loading && <p>Cargando bitácora...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              {/* Formateamos la fecha para que sea legible */}
              <td>{new Date(log.timestamp).toLocaleString('es-MX')}</td>
              <td>{log.user || 'Sistema'}</td>
              <td>{log.action}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageAudits;