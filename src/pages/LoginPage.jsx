// En: src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // --- ¡FUNCIÓN handleLogin CORREGIDA! ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
    // 1. Declaramos la variable del token aquí, en el scope superior
    let receivedToken = null; 

    // --- Paso 1: Intentar Iniciar Sesión ---
    axios.post(`${API_URL}/api/token/`, {
      username: username,
      password: password
    })
    .then(response => {
      // 2. Asignamos el valor a la variable
      receivedToken = response.data.access; 
      
      // --- Paso 2: Verificar si es un Admin ---
      return axios.get(`${API_URL}/api/users/profile/`, {
        headers: { 'Authorization': `Bearer ${receivedToken}` }
      });
    })
    .then(profileResponse => {
      const profile = profileResponse.data;

      // --- Paso 3: Validar el Rol ---
      if (profile.profile.role === 'admin') {
        
        // --- ¡AHORA SÍ FUNCIONA! ---
        // 4. Guardamos el token (que SÍ existe en este scope)
        localStorage.setItem('adminToken', `Bearer ${receivedToken}`);
        
        // Guardamos los datos del usuario para el header
        localStorage.setItem('adminUser', JSON.stringify(profile)); 
        
        // Redireccionamos al panel de admin
        navigate('/admin/reports'); 
        
      } else {
        setError('Acceso denegado. Esta cuenta no es de un administrador.');
      }
    })
    .catch(err => {
      console.error(err);
      setError('Error en el inicio de sesión. Revisa tus credenciales.');
    });
  };
  // --- FIN DE LA FUNCIÓN CORREGIDA ---

  return (
    <div className="login-container">
      <h1>MarketTec - Panel de Administrador</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Usuario (Admin):</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default LoginPage;