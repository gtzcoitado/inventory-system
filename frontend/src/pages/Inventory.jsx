import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function Inventory() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    product: null,
    type: 'Entrada',
    amount: ''
  });
  const [loadingAdjust, setLoadingAdjust] = useState(false);

  useEffect(() => {
    loadStock();
    loadGroups();
  }, []);

  async function loadStock() {
    const { data } = await axios.get('/api/stock');
    setProducts(data);
  }

  async function loadGroups() {
    const { data } = await axios.get('/api/groups');
    setGroups(data);
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
    setLoadingAdjust(true);
    try {
      await axios.post(`/api/stock/${product._id}/adjust`, { type, amount: qty });
      closeModal();
      await loadStock();
    } catch (err) {
      console.error(err);
      alert('Erro ao ajustar estoque');
    } finally {
      setLoadingAdjust(false);
    }
  }

  function formatUpdate(at) {
    const d = new Date(at);
    const now = new Date();
    const diff = now.setHours(0,0,0,0) - d.setHours(0,0,0,0);
    const time = new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 0) return `Hoje ${time}`;
    if (diff === 24*60*60*1000) return `Ontem ${time}`;
    const date = new Date(at).toLocaleDateString([], { day:'2-digit', month:'2-digit' });
    return `${date} ${time}`;
  }

  const filtered = products.filter(p => {
    const txt = filterText.trim().toLowerCase();
    const okTxt =
      !txt ||
      p.name.toLowerCase().includes(txt) ||
      p.group?.name.toLowerCase().includes(txt);
    const okGrp = !filterGroup || p.group?._id === filterGroup;
    return okTxt && okGrp;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Estoque</h2>

      {/* filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por produto ou grupo..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="w-full py-2 sm:py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os grupos</option>
          {groups.map(g => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* mobile: cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filtered.map(p => (
          <div key={p._id} className="bg-white rounded-xl shadow-card p-4 space-y-2">
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="text-gray-600">{p.group?.name}</div>
            <div className="text-gray-800">
              <span className="font-medium">Qtd:</span> {p.stock}
            </div>
            {p.minStock != null && p.stock <= p.minStock && (
              <div className="text-sm text-gray-500 flex items-center">
                ⚠️ Abaixo do mínimo ({p.minStock})
              </div>
            )}
            {p.lastUpdatedAt && (
              <div className="text-xs text-gray-400">
                Última atualização: {formatUpdate(p.lastUpdatedAt)}<br/>
                Atualizado por: {p.lastUpdatedBy || '—'}
              </div>
            )}
            <button
              onClick={() => openModal(p)}
              className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Ajustar
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-8">Nenhum item encontrado.</div>
        )}
      </div>

      {/* desktop: tabela */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Produto','Grupo','Qtd.','Aviso','Ajustar'].map(h => (
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
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4">{p.group?.name}</td>
                  <td className="px-6 py-4 text-center">{p.stock}</td>
                  <td className="px-6 py-4">
                    {p.minStock != null && p.stock <= p.minStock ? (
                      <span className="text-sm text-gray-500 flex items-center">
                        ⚠️ {`<=${p.minStock}`}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                    {p.lastUpdatedAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatUpdate(p.lastUpdatedAt)}<br/>
                        por {p.lastUpdatedBy || '—'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openModal(p)}
                      className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={loadingAdjust}
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
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loadingAdjust}
                >
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={modal.amount}
                  onChange={e => setModal(m => ({ ...m, amount: e.target.value }))}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loadingAdjust}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                disabled={loadingAdjust}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg transition ${
                  loadingAdjust
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-secondary text-white hover:bg-secondary/90'
                }`}
                disabled={loadingAdjust}
              >
                {loadingAdjust ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
