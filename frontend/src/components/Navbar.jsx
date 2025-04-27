// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = React.useState(false);

  // added '/reports' entry here
  const links = [
    ['/',           'Estoque'],
    ['/products',   'Produtos'],
    ['/groups',     'Grupos'],
    ['/checklists','Checklist'],
    ['/roles',      'Funções'],
    ['/users',      'Usuários'],
    ['/reports',    'Relatórios'],    // ← new
  ];
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <h1 className="text-2xl font-bold text-primary">
          {user?.name}
        </h1>

        <nav className="hidden md:flex items-center space-x-6">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-medium ${
                  isActive
                    ? 'text-primary underline'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <button
            onClick={logout}
            className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sair
          </button>
        </nav>

        <button
          className="md:hidden p-2 text-gray-600 hover:text-primary"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md font-medium ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded"
            >
              Sair
            </button>
          </div>
        </nav>
      )}
    </header>
);
}
