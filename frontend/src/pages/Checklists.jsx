import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Trash2, Check } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function Checklists() {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newShift, setNewShift]   = useState(user.shift);
  const [newSector, setNewSector] = useState(user.sector);
  const [newTask, setNewTask]     = useState('');

  const [creating, setCreating]   = useState(false);
  const [taskLoadingId, setTaskLoadingId] = useState(null);
  const [toggleLoading, setToggleLoading] = useState({});  

  const canView = user.role.permissions.includes('Admin') ||
    ['ChecklistView','ChecklistEdit','ChecklistMark']
      .some(p => user.role.permissions.includes(p));
  const canMark = user.role.permissions.includes('Admin') ||
    user.role.permissions.includes('ChecklistMark');
  const canEdit = user.role.permissions.includes('Admin') ||
    user.role.permissions.includes('ChecklistEdit');

  useEffect(() => {
    if (!canView) return;
    (async () => {
      await load();
      setLoading(false);
    })();
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
    await load();
    setCreating(false);
  }

  async function addTask(listId) {
    if (!newTask.trim()) return;
    setTaskLoadingId(listId);
    await axios.post(`/api/checklists/${listId}/tasks`, { text: newTask });
    setNewTask('');
    await load();
    setTaskLoadingId(null);
  }

  async function toggle(listId, tid, done) {
    setToggleLoading(t => ({ ...t, [tid]: true }));
    await axios.patch(`/api/checklists/${listId}/tasks/${tid}`, { done });
    await load();
    setToggleLoading(t => ({ ...t, [tid]: false }));
  }

  async function removeTask(listId, tid) {
    if (!confirm('Remover tarefa?')) return;
    setTaskLoadingId(tid);
    await axios.delete(`/api/checklists/${listId}/tasks/${tid}`);
    await load();
    setTaskLoadingId(null);
  }

  async function removeList(id) {
    if (!confirm('Remover checklist?')) return;
    setCreating(id);
    await axios.delete(`/api/checklists/${id}`);
    await load();
    setCreating(false);
  }

  if (!canView) {
    return <div className="p-4 text-center text-gray-500">Sem permissão para visualizar.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Checklist</h2>

      {canEdit && (
        <form onSubmit={createList} className="grid sm:grid-cols-3 gap-4 items-end">
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
            className="px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50"
          >
            {creating ? 'Criando…' : 'Criar checklist'}
          </button>
        </form>
      )}

      {/* mobile cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {items.map(cl => (
          <div key={cl._id} className="bg-white rounded-xl shadow-card p-4 space-y-3">
            <div className="flex justify-between">
              <div className="font-semibold">{cl.shift} – {cl.sector}</div>
              {canEdit && (
                <button
                  onClick={() => removeList(cl._id)}
                  disabled={creating === cl._id}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {cl.tasks.map(t => (
                <li key={t._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {canMark ? (
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggle(cl._id, t._id, !t.done)}
                        disabled={toggleLoading[t._id]}
                        className="h-5 w-5"
                      />
                    ) : t.done ? (
                      <Check className="text-green-500" />
                    ) : (
                      <span className="w-5 h-5 inline-block" />
                    )}
                    <span className={t.done ? 'line-through' : ''}>{t.text}</span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => removeTask(cl._id, t._id)}
                      disabled={taskLoadingId === t._id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
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
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  onClick={() => addTask(cl._id)}
                  disabled={taskLoadingId === cl._id}
                  className="px-3 py-1 bg-primary text-white rounded-lg disabled:opacity-50"
                >
                  {taskLoadingId === cl._id ? '…' : 'Adicionar'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Checklist</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Tarefas</th>
              {canEdit && <th className="px-6 py-4" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(cl => (
              <tr key={cl._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{cl.shift} – {cl.sector}</td>
                <td className="px-6 py-4">
                  <ul className="space-y-2">
                    {cl.tasks.map(t => (
                      <li key={t._id} className="flex items-center space-x-2">
                        {canMark ? (
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => toggle(cl._id, t._id, !t.done)}
                            disabled={toggleLoading[t._id]}
                            className="h-5 w-5"
                          />
                        ) : t.done ? (
                          <Check className="text-green-500" />
                        ) : (
                          <span className="w-5 h-5 inline-block" />
                        )}
                        <span className={t.done ? 'line-through' : ''}>{t.text}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                {canEdit && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => removeList(cl._id)}
                      disabled={creating === cl._id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
