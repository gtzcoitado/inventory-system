import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Edit2, Trash2 } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState([])
  const [groups, setGroups]     = useState([])
  const [form, setForm]         = useState({ name: '', group: '' })

  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingGroups, setLoadingGroups]     = useState(false)
  const [creating, setCreating]               = useState(false)

  useEffect(() => {
    loadProducts()
    loadGroups()
  }, [])

  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const { data } = await axios.get('/api/products')
      setProducts(data)
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar produtos')
    } finally {
      setLoadingProducts(false)
    }
  }

  async function loadGroups() {
    setLoadingGroups(true)
    try {
      const { data } = await axios.get('/api/groups')
      setGroups(data)
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar grupos')
    } finally {
      setLoadingGroups(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.group) return

    setCreating(true)
    try {
      await axios.post('/api/products', form)
      setForm({ name: '', group: '' })
      await loadProducts()
    } catch (err) {
      console.error(err)
      alert('Erro ao criar produto')
    } finally {
      setCreating(false)
    }
  }

  async function remove(id) {
    if (!confirm('Remover este produto?')) return
    try {
      await axios.delete(`/api/products/${id}`)
      await loadProducts()
    } catch (err) {
      console.error(err)
      alert('Erro ao remover produto')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h2 className="text-3xl font-extrabold text-primary">Produtos</h2>

      {/* form */}
      <form
        onSubmit={submit}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nome do produto</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder={loadingGroups ? 'Aguarde...' : 'Digite o nome'}
            disabled={creating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Grupo</label>
          <select
            value={form.group}
            onChange={e => setForm(f => ({ ...f, group: e.target.value }))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            disabled={loadingGroups || creating}
          >
            <option value="">
              {loadingGroups ? 'Carregando grupos...' : 'Selecione grupo'}
            </option>
            {groups.map(g => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white transition
            ${creating ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-secondary/90'}`}
        >
          {creating ? 'Criando...' : 'Criar'}
        </button>
      </form>

      {/* lista */}
      {loadingProducts ? (
        <div className="text-center text-gray-500 py-8">Carregando produtos...</div>
      ) : (
        <>
          {/* mobile cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map(p => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow-card p-4 flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-gray-500 text-sm">{p.group?.name}</div>
                </div>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum produto cadastrado.
              </div>
            )}
          </div>

          {/* desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Produto','Grupo','Ações'].map(h => (
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
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4">{p.group?.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-4">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => remove(p._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
)
}
