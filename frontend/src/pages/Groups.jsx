import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName]     = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await axios.get('/api/groups');
    setGroups(data);
  }

  async function submit(e) {
    e.preventDefault();
    if (!name) return;
    await axios.post('/api/groups', { name });
    setName('');
    load();
  }

  async function remove(id) {
    if (!confirm('Remover este grupo?')) return;
    await axios.delete(`/api/groups/${id}`);
    load();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Grupos</h2>

      {/* form */}
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Nome do grupo"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition"
        >
          Criar
        </button>
      </form>

      {/* lista mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {groups.map(g => (
          <div
            key={g._id}
            className="bg-white rounded-xl shadow-card p-4 flex justify-between items-center"
          >
            <span>{g.name}</span>
            <button
              onClick={() => remove(g._id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhum grupo cadastrado.
          </div>
        )}
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Grupo','Ações'].map(h => (
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
            {groups.map(g => (
              <tr key={g._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{g.name}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => remove(g._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  Nenhum grupo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
);
}
