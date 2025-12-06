// src/pages/AdminReports.jsx
import { useEffect, useState } from "react";
import { getReports, updateReport } from "../api/reports";
import { getReports, updateReport, banVendorFromReport } from "../api/reports";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://172.200.235.24:8000";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = () => {
    setLoading(true);
    getReports()
      .then((data) => {
        // data es un arreglo: [ {id, reporter, product, reason, evidence, status, created_at}, ... ]
        setReports(data);
      })
      .catch((err) => {
        console.error("Error cargando reportes:", err);
        setError("No se pudieron cargar los reportes");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

 const handleBanVendor = async (report) => {
  // Solo mostramos el motivo en texto (sin imágenes) para confirmación
  const confirmed = window.confirm(
    `¿Seguro que quieres banear al vendedor de este producto por el siguiente motivo?\n\n"${report.reason}"`
  );
  if (!confirmed) return;

  try {
    await banVendorFromReport(report.id);
    alert("Vendedor baneado y reporte marcado como resuelto por la API.");

    // Recargamos la lista para ver el nuevo estado del reporte (ya resuelto)
    loadReports();
  } catch (err) {
    console.error(err);
    alert("Error al banear al vendedor. Revisa la consola para más detalles.");
  }
};


  if (loading) return <p>Cargando reportes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Reportes</h1>

      {reports.length === 0 && <p>No hay reportes registrados.</p>}

      {reports.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={th}>Motivo</th>
              <th style={th}>Vendedor</th>
              <th style={th}>Producto</th>
              <th style={th}>Evidencia</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                {/* MOTIVO EN PALABRAS */}
                <td style={td}>{report.reason}</td>

                {/* INFORMACIÓN DEL VENDEDOR (VIENE DENTRO DEL PRODUCTO) */}
                <td style={td}>
                  {report.product && report.product.vendor ? (
                    <div>
                      <div>
                        <strong>{report.product.vendor.first_name}</strong>
                      </div>
                      <div>{report.product.vendor.career}</div>
                      {report.product.vendor.profile_image && (
                        <img
                          src={buildImageUrl(report.product.vendor.profile_image)}
                          alt="Vendedor"
                          style={smallImg}
                        />
                      )}
                    </div>
                  ) : (
                    "Sin datos de vendedor"
                  )}
                </td>

                {/* INFORMACIÓN DEL PRODUCTO */}
                <td style={td}>
                  {report.product ? (
                    <div>
                      <div>
                        <strong>{report.product.name}</strong>
                      </div>
                      <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
                        {report.product.description}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        Precio: ${report.product.price}
                      </div>
                      <div style={{ fontSize: "0.8rem", marginTop: 4 }}>
                        Categoría: {report.product.category_name}
                      </div>
                      {report.product.product_image && (
                        <img
                          src={buildImageUrl(report.product.product_image)}
                          alt="Producto"
                          style={mediumImg}
                        />
                      )}
                    </div>
                  ) : (
                    "Sin datos de producto"
                  )}
                </td>

                {/* FOTO COMO EVIDENCIA */}
                <td style={td}>
                  {report.evidence ? (
                    <img
                      src={buildImageUrl(report.evidence)}
                      alt="Evidencia"
                      style={bigImg}
                    />
                  ) : (
                    "Sin evidencia"
                  )}
                  <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                    Fecha: {new Date(report.created_at).toLocaleString()}
                  </div>
                </td>

                {/* ESTADO DEL REPORTE */}
                <td style={td}>
                  {report.status === "pending" && (
                    <span style={{ color: "orange" }}>Pendiente</span>
                  )}
                  {report.status === "attended" && (
                    <span style={{ color: "green" }}>Atendido</span>
                  )}
                  {report.status !== "pending" &&
                    report.status !== "attended" && (
                      <span>{report.status}</span>
                    )}
                </td>

                {/* ACCIONES (AQUÍ VENDRÁ BANEAR / PROLONGAR y ya está "ATENDIDO") */}
                <td style={td}>
  <button onClick={() => handleMarkAttended(report)}>
    Marcar como atendido
  </button>

  <button
    style={{ marginLeft: "0.5rem" }}
    onClick={() => handleBanVendor(report)}
  >
    Banear usuario
  </button>

  {/* Aquí luego pondremos el botón de "Prolongar baneo" cuando identifiques el endpoint en Swagger */}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { border: "1px solid #ccc", padding: "0.5rem" };
const td = {
  border: "1px solid #ccc",
  padding: "0.5rem",
  verticalAlign: "top",
};

const smallImg = {
  width: 60,
  height: 60,
  objectFit: "cover",
  marginTop: 4,
};

const mediumImg = {
  width: 80,
  height: 80,
  objectFit: "cover",
  marginTop: 4,
};

const bigImg = {
  maxWidth: 120,
  maxHeight: 120,
  objectFit: "cover",
  display: "block",
};

function buildImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_URL}${path}`;
}

export default AdminReports;
