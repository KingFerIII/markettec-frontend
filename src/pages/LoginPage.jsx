import React, { useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // 1. Pedimos el token
    client.post('/token/', {
      username: username,
      password: password
    })
    .then(response => {
      // --- CAMBIO CLAVE AQUÍ ---
      // Obtenemos el token
      const token = "Bearer " + response.data.access;
      
      // ¡Lo guardamos en el navegador INMEDIATAMENTE!
      // Así el interceptor de client.js ya lo puede leer para la siguiente petición.
      localStorage.setItem('adminToken', token);
      
      // 2. Pedimos el perfil
      // Ya NO necesitamos pasar headers manuales, el interceptor lo hará solito.
      return client.get('/users/profile/');
    })
    .then(profileResponse => {
      const profile = profileResponse.data;

      if (profile.profile.role === 'admin') {
        // Guardamos los datos del usuario
        localStorage.setItem('adminUser', JSON.stringify(profile)); 
        navigate('/admin/reports'); 
      } else {
        // Si no es admin, borramos el token que acabamos de guardar
        localStorage.removeItem('adminToken');
        setError('Acceso denegado. Esta cuenta no es de un administrador.');
      }
    })
    .catch(err => {
      console.error(err);
      // Si falló algo, limpiamos por si acaso
      localStorage.removeItem('adminToken');
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