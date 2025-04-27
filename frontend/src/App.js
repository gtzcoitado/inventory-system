// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Groups from './pages/Groups';
import Checklists from './pages/Checklists';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Reports from './pages/Reports';   // ← imported

export default function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          {/* pública */}
          <Route path="/login" element={<Login />} />

          {/* protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute permission="Estoque">
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute permission="Produtos">
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute permission="Grupos">
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checklists"
            element={
              <ProtectedRoute permission="ChecklistView">
                <Checklists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute permission="Funções">
                <Roles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute permission="Usuários">
                <Users />
              </ProtectedRoute>
            }
          />

          {/* new reports route */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute permission="Relatórios">
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}
