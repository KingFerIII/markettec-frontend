// En: src/pages/ManageReports.jsx
// (Actualizado para mostrar detalles completos del producto)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar reportes (sin cambios)
  const fetchReports = () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    axios.get(`${API_URL}/api/reports/`, {
      headers: { 'Authorization': token }
    })
    .then(response => {
      setReports(response.data); 
      setLoading(false);
    })
    .catch(err => {
      setError("No se pudieron cargar los reportes.");
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchReports();
  }, []); 

  // 2. Marcar como resuelto (sin cambios)
  const handleResolveReport = (reportId) => {
    if (!window.confirm(`¿Estás seguro de que quieres marcar este reporte como resuelto?`)) {
      return;
    }
    const token = localStorage.getItem('adminToken');
    axios.patch(`${API_URL}/api/reports/${reportId}/`, { status: "resolved" }, {
      headers: { 'Authorization': token }
    })
    .then(() => fetchReports())
    .catch(err => alert("Error al resolver el reporte."));
  };

  // 3. Borrar producto (sin cambios)
  const handleDeleteProduct = (productId, productName) => {
     if (!window.confirm(`ACCIÓN: ¿Estás seguro de que quieres BORRAR el producto '${productName}'?`)) {
      return;
    }
     const token = localStorage.getItem('adminToken');
     axios.delete(`${API_URL}/api/products/${productId}/`, {
       headers: { 'Authorization': token }
     })
     .then(() => fetchReports()) // Recargamos la lista de reportes
     .catch(err => alert("Error al borrar el producto."));
  };


  return (
    <div>
      <h2>Gestionar Reportes de Productos</h2>
      <p>Revisa los productos reportados por los usuarios y toma una acción.</p>
      
      {loading && <p>Cargando reportes...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reports.map(report => (
          <li key={report.id} style={{ border: '1px solid var(--border-color)', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: 'var(--white-panel)' }}>
            
            {/* --- ¡DETALLES DEL PRODUCTO AÑADIDOS! --- */}
            {report.product ? (
              <>
                <h3>Producto: {report.product.name} (ID: {report.product.id})</h3>
                <p><strong>Vendedor:</strong> {report.product.vendor?.first_name || 'N/A'}</p>
                <p><strong>Precio:</strong> ${report.product.price} | <strong>Inventario:</strong> {report.product.inventory}</p>
                <p><strong>Categoría:</strong> {report.product.category_name || 'N/A'}</p>
                <p><strong>Descripción:</strong> {report.product.description}</p>
              </>
            ) : (
              <h3>(Producto Eliminado)</h3>
            )}
            
            <hr style={{ borderColor: 'var(--border-color)', opacity: 0.5, margin: '1rem 0' }} />

            {/* --- Detalles del Reporte --- */}
            <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Razón del Reporte (de {report.reporter?.first_name || 'N/A'}):</p>
            <p style={{fontStyle: 'italic'}}>"{report.reason}"</p>
            
            {/* Botones de Acción */}
            <button 
              style={{ background: 'var(--success-green)', color: 'white', marginRight: '10px' }}
              onClick={() => handleResolveReport(report.id)}
            >
              Marcar como Resuelto
            </button>
            
            {/* Solo muestra el botón de borrar si el producto aún existe */}
            {report.product && (
              <button 
                style={{ background: 'var(--danger-red)', color: 'white' }}
                onClick={() => handleDeleteProduct(report.product.id, report.product.name)}
              >
                Borrar Producto
              </button>
            )}
          </li>
        ))}
      </ul>

      {!loading && reports.length === 0 && (
        <p>¡Buen trabajo! No hay reportes pendientes de revisión.</p>
      )}
    </div>
  );
}

export default ManageReports;