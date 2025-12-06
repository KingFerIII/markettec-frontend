// En: src/pages/LoginPage.jsx

import React, { useState } from 'react';
import client from '../api/client'; // <--- IMPORTANTE: Usamos nuestro cliente configurado
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Variable temporal para guardar el token
    let receivedToken = null; 

    // 1. Usamos 'client.post' (Ya sabe que va a http://172.200.235.24:8000/api)
    // Solo agregamos la parte final de la ruta: '/token/'
    client.post('/token/', {
      username: username,
      password: password
    })
    .then(response => {
      receivedToken = "Token " + response.data.access; 
      
      // 2. Pedimos el perfil. 
      // NOTA: Pasamos el header manual aquí porque el interceptor lee de localStorage,
      // y todavía no hemos guardado nada en localStorage.
      return client.get('/users/profile/', {
        headers: { 'Authorization': receivedToken }
      });
    })
    .then(profileResponse => {
      const profile = profileResponse.data;

      if (profile.profile.role === 'admin') {
        // 3. ¡Éxito! Guardamos todo
        localStorage.setItem('adminToken', receivedToken);
        localStorage.setItem('adminUser', JSON.stringify(profile)); 
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