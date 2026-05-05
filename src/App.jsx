import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  });

  const handleLogin = (u) => setUsuario(u);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return usuario ? (
    <Dashboard usuario={usuario} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}
