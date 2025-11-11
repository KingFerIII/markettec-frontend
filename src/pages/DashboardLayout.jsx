// En: src/pages/DashboardLayout.jsx

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { MdMenu } from 'react-icons/md'; 

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // Para el título
  
  // Función para obtener el título basado en la ruta
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/reports':
        return 'Gestionar Reportes';
      case '/admin/products':
        return 'Gestionar Usuarios';
      case '/admin/categories':
        return 'Gestionar Categorías';
      case '/admin/audits':
        return 'Bitácora de Auditoría';
      case '/admin/banned-users':
        return 'Usuarios Baneados';
      default:
        return 'Dashboard'; // Título por defecto
    }
  };

  const token = localStorage.getItem('adminToken');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('adminUser'));

  // 1. Guardia de Seguridad
  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]); // Se activa si el token cambia o al cargar

  // --- ¡AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA! ---
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/');
  };
  // ----------------------------------------

  if (!token) { return null; }

  // 3. El panel
  return (
    <div className="dashboard-layout">
      
      {/* --- SIDEBAR --- */}
      <nav className="sidebar">
        <h3>MarketTec</h3>
        <ul>
          <li>
            <Link to="/admin/reports">Gestionar Reportes</Link>
          </li>
          <li>
            <Link to="/admin/users">Gestionar Usuarios</Link>
          </li>
          <li>
            <Link to="/admin/banned-users">Usuarios Baneados</Link>
          </li>
          <li>
            <Link to="/admin/categories">Gestionar Categorías</Link>
          </li>
          <li>
            <Link to="/admin/audits">Bitácora de Auditoría</Link>
          </li>
        </ul>
      </nav>

      {/* --- ENVOLTURA DEL CONTENIDO --- */}
      <div className="content-wrapper">
        
        {/* --- HEADER SUPERIOR --- */}
        <header className="top-header">
          <div className="header-content">
            
            <div className="header-title">
              <h2>{getPageTitle()}</h2> {/* El título dinámico */}
            </div>
            
            <div className="profile-menu">
              <button 
                className="profile-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user?.username || 'Admin'} 
                <MdMenu style={{ marginLeft: '8px', fontSize: '1.2rem', verticalAlign: 'middle' }} />
              </button>
              
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <Link to="/admin/profile-edit">Editar Perfil</Link>
                  {/* Esta línea ahora SÍ encontrará la función handleLogout */}
                  <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    Cerrar Sesión
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}

export default DashboardLayout;