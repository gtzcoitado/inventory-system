import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('user')) || null
  );
  const navigate = useNavigate();

  // Sempre que o user mudar, atualiza o localStorage
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // função de login (ajuste conforme sua rota)
  async function login(name, password) {
    const res = await axios.post('/api/auth/login', { name, password });
    setUser(res.data.user);
    navigate(res.data.user.role.defaultRoute);
  }

  // função de logout
  function logout() {
    setUser(null);
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
