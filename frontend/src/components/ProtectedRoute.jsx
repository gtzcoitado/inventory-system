// src/components/ProtectedRoute.jsx
import React from 'react';
import { useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function ProtectedRoute({ children, permission }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Se não estiver logado, vai para /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin sempre tem acesso
  if (user.role.permissions.includes('Admin')) {
    return children;
  }

  // Se for a rota padrão desse usuário, também libera
  if (user.role.defaultRoute === location.pathname) {
    return children;
  }

  // Se não foi declarada permissão (rota aberta a todos logados), libera
  if (!permission) {
    return children;
  }

  // Se tiver a permissão específica, libera
  if (user.role.permissions.includes(permission)) {
    return children;
  }

  // Caso contrário, mensagem de acesso negado
  return <p>Você não tem permissão para acessar esta página.</p>;
}
