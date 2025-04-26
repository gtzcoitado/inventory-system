import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit2 } from 'lucide-react';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [form, setForm]   = useState({
    name: '',
    permissions: [],
    defaultRoute: '/estoque'
  });

  const allPerms = [
    ['Admin', 'Administrador (todas)'],
    ['Estoque', 'Estoque'],
    ['Produtos','Produtos'],
    ['Grupos',  'Grupos'],
    ['ChecklistView','Ver checklist'],
    ['ChecklistEdit','Editar checklist'],
    ['ChecklistMark','Marcar tarefa'],
    ['Funções','Funções'],
    ['Usuários','Usuários']
  ];

  const routes = [
    ['/estoque','Estoque'],
    ['/products','Produtos'],
    ['/groups','Grupos'],
    ['/checklists','Checklist'],
    ['/roles','Funções'],
    ['/users','Usuários']
  ];

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await axios.get('/api/roles');
    setRoles(data);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name) return;
    await axios.post('/api/roles', form);
    setForm({ name:'', permissions:[], defaultRoute:'/estoque' });
    load();
  }

  async function remove(id) {
    if (!confirm('Remover esta função?')) return;
    await axios.delete(`/api/roles/${id}`);
    load();
  }

  function togglePerm(p) {
    setForm(f => {
      const perms = f.permissions.includes(p)
        ? f.permissions.filter(x => x !== p)
        : [...f.permissions, p];
      return { ...f, permissions: perms };
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Funções</h2>

      {/* form */}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome da função"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
          />
          <select
            value={form.defaultRoute}
            onChange={e => setForm(f => ({ ...f, defaultRoute: e.target.value }))}
            className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
          >
            {routes.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {allPerms.map(([v, l]) => (
            <label key={v} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.permissions.includes(v)}
                onChange={() => togglePerm(v)}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <span className="text-sm">{l}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition"
        >
          Criar função
        </button>
      </form>

      {/* mobile list */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {roles.map(r => (
          <div key={r._id} className="bg-white rounded-xl shadow-card p-4">
            <div className="flex justify-between items-center">
              <div className="font-semibold">{r.name}</div>
              <button
                onClick={() => remove(r._id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="text-gray-600 text-sm mt-2">
              Permissões: {r.permissions.join(', ')}
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhuma função cadastrada.
          </div>
        )}
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Função','Permissões','Ações'].map(h => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {roles.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{r.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {r.permissions.map(p => (
                      <span
                        key={p}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => remove(r._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  Nenhuma função cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
);
}
