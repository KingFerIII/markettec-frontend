// En: src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
// Importamos los componentes del Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
// Importamos nuestras nuevas "páginas"
import LoginPage from './pages/LoginPage'
import DashboardLayout from './pages/DashboardLayout'
import App from './App' // Dejamos App.jsx como el "home" por ahora
import ManageUsers from './pages/ManageUsers'
import ManageCategories from './pages/ManageCategories'
import ManageAudits from './pages/ManageAudits'
import ManageReports from './pages/ManageReports'
import BannedUsers from './pages/BannedUsers'
// --- Definimos nuestras rutas ---
const router = createBrowserRouter([
  {
    path: '/', // La ruta raíz
    element: <LoginPage />, // Mostrará el Login
  },
  {
    path: '/admin', // La ruta para el admin
    element: <DashboardLayout />, // Carga el "caparazón" del Dashboard
    children: [
      {
        path: 'reports', // <-- Nueva ruta
        element: <ManageReports />, // <-- Nuevo componente
      },
      {
        path: 'banned-users', // URL: /admin/banned-users
        element: <BannedUsers />,
      },
      // Estas son las "sub-páginas" que se mostrarán en el centro
      {
         path: 'users', // URL: /admin/users (para el futuro)
         element: <ManageUsers/>,
      },

      {
        path: 'categories', // URL: /admin/categories
        element: <ManageCategories />, // ¡Usamos el nuevo componente!
      },
      {
        path: 'audits', // URL: /admin/audits
        element: <ManageAudits />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ¡Aquí le decimos a React que use el Router! */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)