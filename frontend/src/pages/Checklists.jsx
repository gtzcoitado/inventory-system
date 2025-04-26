// src/pages/Checklists.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Trash2, Check, Loader2 } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function Checklists() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [newShift, setNewShift]   = useState(user.shift);
  const [newSector, setNewSector] = useState(user.sector);
  const [newTask, setNewTask]     = useState('');
  const [toggling, setToggling]   = useState(null);    // ← which task-id is loading
  const [creating, setCreating]   = useState(false);   // ← loading state for “create list”
  const [adding, setAdding]       = useState(null);    // ← loading state for “add task” per checklist

  const canView = user.role.permissions.includes('Admin') ||
    ['ChecklistView','ChecklistEdit','ChecklistMark']
      .some(p => user.role.permissions.includes(p));
  const canMark = user.role.permissions.includes('Admin') ||
    user.role.permissions.includes('ChecklistMark');
  const canEdit = user.role.permissions.includes('Admin') ||
    user.role.permissions.includes('ChecklistEdit');

  useEffect(() => {
    if (canView) load();
  }, [canView]);

  async function load() {
    const { data } = await axios.get('/api/checklists');
    let arr = data;
    if (!user.role.permissions.includes('Admin')) {
      arr = arr.filter(
        c => c.shift === user.shift && c.sector === user.sector
      );
    }
    setItems(arr);
  }

  async function createList(e) {
    e.preventDefault();
    setCreating(true);
    await axios.post('/api/checklists', {
      shift: newShift,
      sector: newSector,
      tasks: []
    });
    setCreating(false);
    load();
  }

  async function addTask(id) {
    if (!newTask.trim()) return;
    setAdding(id);
    await axios.post(`/api/checklists/${id}/tasks`, { text: newTask });
    setNewTask('');
    setAdding(null);
    load();
  }

  async function toggle(listId, tid, done) {
    setToggling(tid);
    await axios.patch(`/api/checklists/${listId}/tasks/${tid}`, { done });
    setToggling(null);
    load();
  }

  async function removeTask(id, tid) {
    if (!confirm('Remover tarefa?')) return;
    await axios.delete(`/api/checklists/${id}/tasks/${tid}`);
    load();
  }

  async function removeList(id) {
    if (!confirm('Remover checklist?')) return;
    await axios.delete(`/api/checklists/${id}`);
    load();
  }

  if (!canView) {
    return (
      <div className="p-4 text-center text-gray-500">
        Sem permissão para visualizar.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Checklist</h2>

      {canEdit && (
        <form
          onSubmit={createList}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
        >
          <select
            value={newShift}
            onChange={e => setNewShift(e.target.value)}
            className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
          >
            <option>Manhã</option>
            <option>Noite</option>
          </select>
          <select
            value={newSector}
            onChange={e => setNewSector(e.target.value)}
            className="p-2 border rounded-lg focus:ring-primary focus:ring-2"
          >
            <option>Cozinha</option>
            <option>Salão</option>
            <option>Pizza</option>
            <option>Churrasqueira</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className={`px-4 py-2 text-white rounded-lg transition
              ${creating ? 'bg-gray-400 cursor-wait' : 'bg-secondary hover:bg-secondary/90'}`}
          >
            {creating ? <Loader2 className="animate-spin inline-block" size={16}/> : 'Criar checklist'}
          </button>
        </form>
      )}

      {/* mobile cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {items.map(cl => (
          <div
            key={cl._id}
            className="bg-white rounded-xl shadow-card p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold">{cl.shift} – {cl.sector}</div>
              {canEdit && (
                <button
                  onClick={() => removeList(cl._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {cl.tasks.map(t => (
                <li
                  key={t._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {toggling === t._id
                      ? <Loader2 className="animate-spin text-gray-500" size={20}/>
                      : canMark
                        ? (
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => toggle(cl._id, t._id, !t.done)}
                            className="h-5 w-5"
                          />
                        )
                        : t.done
                          ? <Check className="text-green-500"/>
                          : <span className="w-5 h-5 inline-block"/>
                    }
                    <span className={t.done ? 'line-through text-gray-400' : ''}>
                      {t.text}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => removeTask(cl._id, t._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {canEdit && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="Nova tarefa"
                  className="flex-1 p-2 border rounded-lg focus:ring-primary focus:ring-2"
                />
                <button
                  onClick={() => addTask(cl._id)}
                  disabled={adding === cl._id}
                  className={`px-3 py-1 text-white rounded-lg transition
                    ${adding === cl._id ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {adding === cl._id
                    ? <Loader2 className="animate-spin inline-block" size={16}/>
                    : 'Adicionar'}
                </button>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhum checklist.
          </div>
        )}
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Checklist</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Tarefas</th>
              {canEdit && <th className="px-6 py-4"/>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map(cl => (
              <tr key={cl._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {cl.shift} – {cl.sector}
                </td>
                <td className="px-6 py-4">
                  <ul className="space-y-2">
                    {cl.tasks.map(t => (
                      <li key={t._id} className="flex items-center space-x-2">
                        {toggling === t._id
                          ? <Loader2 className="animate-spin text-gray-500" size={20}/>
                          : canMark
                            ? (
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => toggle(cl._id, t._id, !t.done)}
                                className="h-5 w-5"
                              />
                            )
                            : t.done
                              ? <Check className="text-green-500"/>
                              : <span className="w-5 h-5 inline-block"/>
                        }
                        <span className={t.done ? 'line-through text-gray-400' : ''}>
                          {t.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                {canEdit && (
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => removeList(cl._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 3 : 2} className="px-6 py-8 text-center text-gray-400">
                  Nenhum checklist.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
