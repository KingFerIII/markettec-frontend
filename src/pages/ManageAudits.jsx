import React, { useState, useEffect } from 'react';
import client from '../api/client'; // <--- Importamos el cliente

function ManageAudits() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Llamada limpia usando el cliente
    client.get('/audits/')
      .then(response => {
        setLogs(response.data); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar la bitácora:", err);
        setError("No se pudo cargar la bitácora de auditoría.");
        setLoading(false);
      });
    
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Bitácora de Auditoría</h2>
      <p>Un registro de las acciones importantes que han sucedido en el sistema.</p>
      
      {loading && <p>Cargando bitácora...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{background: '#eee', textAlign: 'left'}}>
              <th style={{padding: '10px'}}>Fecha y Hora</th>
              <th style={{padding: '10px'}}>Usuario</th>
              <th style={{padding: '10px'}}>Acción</th>
              <th style={{padding: '10px'}}>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '10px'}}>{new Date(log.timestamp).toLocaleString('es-MX')}</td>
                <td style={{padding: '10px'}}>
                    <strong>{log.user || 'Sistema'}</strong>
                </td>
                <td style={{padding: '10px'}}>{log.action}</td>
                <td style={{padding: '10px', color: '#555'}}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageAudits;