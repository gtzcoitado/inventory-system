// src/pages/Inventory.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from '../api'; // instância com baseURL e withCredentials
import { Search } from 'lucide-react';
import { AuthContext } from '../AuthContext';

function formatLastUpdate(iso) {
  if (!iso) return '–';
  const d = new Date(iso);
  if (isNaN(d)) return '–';
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (d.toDateString() === now.toDateString()) {
    return `Hoje às ${time}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Ontem às ${time}`;
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${time}`;
}

export default function Inventory() {
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [groups, setGroups]     = useState([]);

  const [filterText, setFilterText]         = useState('');
  const [filterGroup, setFilterGroup]       = useState('');
  const [filterBelowMin, setFilterBelowMin] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    product: null,
    type: 'Entrada',
    amount: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStock();
    loadGroups();
  }, []);

  async function loadStock() {
    try {
      const { data } = await axios.get('/api/stock');
      // normaliza updatedAt / updatedBy
      const norm = data.map(p => ({
        ...p,
        updatedAt: p.updatedAt || p.lastUpdatedAt,
        updatedBy: p.updatedBy || p.lastUpdatedBy?.name || '–'
      }));
      setProducts(norm);
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
    }
  }

  async function loadGroups() {
    try {
      const { data } = await axios.get('/api/groups');
      setGroups(data);
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    }
  }

  function openModal(product) {
    setModal({ isOpen: true, product, type: 'Entrada', amount: '' });
  }

  function closeModal() {
    setModal(m => ({ ...m, isOpen: false }));
  }

  async function handleConfirm() {
    const { product, type, amount } = modal;
    const qty = Number(amount);
    if (!qty || qty <= 0) {
      alert('Quantidade inválida');
      return;
    }
    setSaving(true);
    try {
      const { data: updated } = await axios.post(
        `/api/stock/${product._id}/adjust`,
        { type, amount: qty, userId: user._id }
      );
      const norm = {
        ...updated,
        updatedAt: updated.updatedAt || updated.lastUpdatedAt,
        updatedBy: updated.updatedBy || updated.lastUpdatedBy?.name || '–'
      };
      setProducts(prev =>
        prev.map(p => (p._id === norm._id ? norm : p))
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Erro ao ajustar estoque');
    } finally {
      setSaving(false);
    }
  }

  const filtered = products.filter(p => {
    const txt = filterText.trim().toLowerCase();
    const okTxt =
      !txt ||
      p.name.toLowerCase().includes(txt) ||
      p.group?.name.toLowerCase().includes(txt);
    const okGrp     = !filterGroup || p.group?._id === filterGroup;
    const okBelow   = !filterBelowMin || p.stock < p.minStock;
    return okTxt && okGrp && okBelow;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Estoque</h2>

      {/* filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por produto ou grupo..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os grupos</option>
          {groups.map(g => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filterBelowMin}
            onChange={e => setFilterBelowMin(e.target.checked)}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <span className="text-gray-700">Abaixo do mínimo</span>
        </label>
      </div>

      {/* mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filtered.map(p => (
          <div key={p._id} className="bg-white rounded-xl shadow-card p-4 space-y-2">
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="text-gray-600">{p.group?.name}</div>
            <div className="text-gray-800">
              <span className="font-medium">Qtd:</span> {p.stock}
            </div>
            {p.stock < p.minStock && (
              <div className="text-sm text-red-600 italic">
                ⚠️ Abaixo do mínimo ({p.minStock})
              </div>
            )}
            <div className="text-xs text-gray-500 italic">
              Última atualização: {formatLastUpdate(p.updatedAt)}<br/>
              Atualizado por: <span className="font-medium">{p.updatedBy}</span>
            </div>
            <button
              onClick={() => openModal(p)}
              className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Ajustar
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-8">Nenhum item encontrado.</div>
        )}
      </div>

      {/* desktop */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Produto','Grupo','Qtd.','Última atualização','Ajustar'].map(h => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4">{p.group?.name}</td>
                  <td className="px-6 py-4 text-center">
                    {p.stock}
                    {p.stock < p.minStock && (
                      <div className="text-xs text-red-600 italic mt-1">
                        ⚠️ Abaixo do mínimo ({p.minStock})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 italic">
                    {formatLastUpdate(p.updatedAt)}<br/>
                    Atualizado por: <span className="font-medium">{p.updatedBy}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openModal(p)}
                      className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90"
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative">
            <button
              onClick={closeModal}
              disabled={saving}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4">{modal.product.name}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de ajuste</label>
                <select
                  value={modal.type}
                  onChange={e => setModal(m => ({ ...m, type: e.target.value }))}
                  disabled={saving}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Saida">Saída</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={modal.amount}
                  onChange={e => setModal(m => ({ ...m, amount: e.target.value }))}
                  disabled={saving}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className={`px-4 py-2 rounded-lg ${
                  saving ? 'bg-gray-300 text-gray-600' : 'bg-secondary text-white hover:bg-secondary/90'
                } flex items-center`}
              >
                {saving ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"/>
                  </svg>
                ) : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
