import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm]   = useState({
    name: '',
    password: '',
    role: '',
    shift: '',
    sector: ''
  });

  useEffect(() => {
    load();
    loadRoles();
  }, []);

  async function load() {
    const { data } = await axios.get('/api/users');
    setUsers(data);
  }
  async function loadRoles() {
    const { data } = await axios.get('/api/roles');
    setRoles(data);
  }

  async function submit(e) {
    e.preventDefault();
    const { name, password, role, shift, sector } = form;
    if (!name||!password||!role||!shift||!sector) return;
    await axios.post('/api/users', form);
    setForm({ name:'',password:'',role:'',shift:'',sector:'' });
    load();
  }

  async function remove(id) {
    if (!confirm('Remover este usuário?')) return;
    await axios.delete(`/api/users/${id}`);
    load();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Usuários</h2>

      {/* form */}
      <form className="grid grid-cols-1 sm:grid-cols-5 gap-4" onSubmit={submit}>
        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
        />
        <select
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
        >
          <option value="">Função</option>
          {roles.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
        <select
          value={form.shift}
          onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
          className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
        >
          <option value="">Turno</option>
          <option value="Manha">Manhã</option>
          <option value="Noite">Noite</option>
        </select>
        <select
          value={form.sector}
          onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
          className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
        >
          <option value="">Setor</option>
          <option value="Cozinha">Cozinha</option>
          <option value="Salão">Salão</option>
          <option value="Pizza">Pizza</option>
          <option value="Churrasqueira">Churrasqueira</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition col-span-full sm:col-span-5"
        >
          Criar usuário
        </button>
      </form>

      {/* mobile cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map(u => (
          <div
            key={u._id}
            className="bg-white rounded-xl shadow-card p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{u.name}</div>
              <div className="text-gray-500 text-sm">
                {u.role?.name} — {u.shift} — {u.sector}
              </div>
            </div>
            <button
              onClick={() => remove(u._id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhum usuário cadastrado.
          </div>
        )}
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome','Função','Turno','Setor','Ações'].map(h => (
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
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4">{u.role?.name}</td>
                <td className="px-6 py-4">{u.shift}</td>
                <td className="px-6 py-4">{u.sector}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => remove(u._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
);
}
