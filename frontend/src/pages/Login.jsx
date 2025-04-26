import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    login(name, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo-orla33.png"
            alt="Orla33 SteakHouse"
            className="h-24 w-auto"
          />
        </div>

        <h2 className="text-2xl font-bold text-secondary text-center">
          Bem-vindo, faça login
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Usuário
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Seu usuário"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
