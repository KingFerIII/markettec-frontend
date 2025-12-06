// En: src/pages/ManageReports.jsx
import { useEffect, useState } from "react";
import { getReports, banUser, updateReportStatus } from "../api/reports"; // Usamos nuestra API limpia

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://172.200.235.24/api").replace(/\/$/, "");

function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el Modal de Acciones
  const [selectedReport, setSelectedReport] = useState(null); // Reporte seleccionado para ver detalle
  const [actionLoading, setActionLoading] = useState(false);

  // Carga inicial
  const loadReports = () => {
    setLoading(true);
    getReports()
      .then((data) => {
        setReports(data);
      })
      .catch((err) => {
        console.error("Error cargando reportes:", err);
        setError("No se pudieron cargar los reportes. Revisa que el backend esté activo.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  // --- LÓGICA DE ACCIONES ---

  // 1. Banear Vendedor
  const handleBan = async (report) => {
    if (!report.product?.vendor?.id) {
      alert("Error: No se encuentra la ID del vendedor.");
      return;
    }

    const reason = prompt("Escribe el motivo del BANEO (esto lo verá el usuario):");
    if (!reason) return;

    if (!window.confirm(`¿Confirmas banear a ${report.product.vendor.first_name}?`)) return;

    setActionLoading(true);
    try {
      await banUser(report.product.vendor.id, reason);
      alert("Usuario baneado correctamente.");
      setSelectedReport(null); // Cerramos modal
      loadReports(); // Recargamos la tabla
    } catch (err) {
      console.error(err);
      alert("Error al banear al usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Marcar como Atendido
  const handleAttended = async (report) => {
    const feedback = prompt("Escribe una respuesta para el usuario que reportó (Feedback):", "Gracias, hemos revisado tu reporte.");
    if (!feedback) return;

    setActionLoading(true);
    try {
      await updateReportStatus(report.id, "attended", feedback);
      alert("Reporte marcado como atendido.");
      setSelectedReport(null);
      loadReports();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el reporte.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDERIZADO ---

  if (loading) return <div style={{ padding: "2rem" }}>Cargando sistema de reportes...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Gestión de Reportes</h1>
      <p>Revisa las evidencias y toma acción sobre los usuarios reportados.</p>

      {/* TABLA PRINCIPAL */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={th}>ID</th>
              <th style={th}>Motivo</th>
              <th style={th}>Producto / Vendedor</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>#{report.id}</td>
                <td style={td}>
                    <strong>{report.reason}</strong>
                    <br/>
                    <small style={{color: '#666'}}>{new Date(report.created_at).toLocaleDateString()}</small>
                </td>
                
                <td style={td}>
                  {report.product ? (
                    <div>
                        <span style={{ fontWeight: "bold" }}>Prod: {report.product.name}</span>
                        <br />
                        <span>Vend: {report.product.vendor?.first_name || "Desconocido"}</span>
                    </div>
                  ) : (
                    <span style={{ color: "red" }}>Producto eliminado</span>
                  )}
                </td>

                <td style={td}>
                  {report.status === "pending" && <span style={badge("orange")}>Pendiente</span>}
                  {report.status === "attended" && <span style={badge("green")}>Atendido</span>}
                  {report.status === "resolved" && <span style={badge("blue")}>Resuelto</span>}
                </td>

                <td style={td}>
                  <button 
                    onClick={() => setSelectedReport(report)}
                    style={btnPrimary}
                  >
                    🔍 Ver Detalles y Accionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && <p style={{textAlign: "center", marginTop: "2rem"}}>No hay reportes pendientes.</p>}

      {/* --- MODAL DE DETALLES --- */}
      {selectedReport && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h2>Detalles del Reporte #{selectedReport.id}</h2>
                <button onClick={() => setSelectedReport(null)} style={{cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5rem'}}>✖</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                
                {/* COLUMNA IZQUIERDA: INFO */}
                <div>
                    <h3>Motivo:</h3>
                    <p style={{backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px'}}>"{selectedReport.reason}"</p>
                    
                    <h3>Involucrados:</h3>
                    <p><strong>Reportado por:</strong> {selectedReport.reporter?.first_name || "Anónimo"}</p>
                    
                    {selectedReport.product && (
                        <div style={{border: '1px solid #ddd', padding: '10px', borderRadius: '4px', marginTop: '10px'}}>
                            <strong>Producto Reportado:</strong> {selectedReport.product.name}
                            <br/>
                            <strong>Vendedor:</strong> {selectedReport.product.vendor?.first_name} ({selectedReport.product.vendor?.email})
                            <br/>
                            <small>ID Vendedor: {selectedReport.product.vendor?.id}</small>
                        </div>
                    )}
                </div>

                {/* COLUMNA DERECHA: EVIDENCIAS */}
                <div>
                    <h3>Evidencia Principal:</h3>
                    {selectedReport.evidence ? (
                        <a href={buildImageUrl(selectedReport.evidence)} target="_blank" rel="noreferrer">
                            <img 
                                src={buildImageUrl(selectedReport.evidence)} 
                                alt="Evidencia" 
                                style={{width: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ccc'}}
                            />
                        </a>
                    ) : (
                        <p>No se adjuntó foto principal.</p>
                    )}

                    {/* Aquí podrías mapear más capturas si el backend las devuelve en un array */}
                </div>
            </div>

            {/* BOTONERA DE ACCIONES */}
            <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                {actionLoading ? (
                    <p>Procesando...</p>
                ) : (
                    <>
                        <button 
                            onClick={() => handleAttended(selectedReport)}
                            style={{...btnAction, backgroundColor: '#28a745'}}
                        >
                            ✅ Marcar como Atendido
                        </button>
                        
                        <button 
                            onClick={() => handleBan(selectedReport)}
                            style={{...btnAction, backgroundColor: '#dc3545'}}
                        >
                            🚫 Banear Vendedor
                        </button>
                    </>
                )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// --- ESTILOS SIMPLES (CSS-in-JS) ---
const th = { padding: "12px", borderBottom: "2px solid #ddd" };
const td = { padding: "10px", borderBottom: "1px solid #eee" };

const badge = (color) => ({
    backgroundColor: color,
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "bold"
});

const btnPrimary = {
    padding: "6px 12px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px"
};

const btnAction = {
    padding: "10px 20px",
    cursor: "pointer",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    fontSize: "1rem"
};

// Estilos del Modal
const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
};

const modalContent = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

function buildImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default ManageReports;