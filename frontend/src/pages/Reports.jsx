import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function Reports() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/stock/movements');
      // expect each item: { _id, product:{name}, type, amount, date, user:{name} }
      setMovements(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  }

  // group by yyyy-MM-dd
  const byDay = movements.reduce((acc, mv) => {
    const day = mv.date.slice(0,10);
    (acc[day] ||= []).push(mv);
    return acc;
  }, {});

  const days = Object.keys(byDay).sort((a,b)=>b.localeCompare(a));

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <h2 className="text-3xl font-extrabold text-primary">Relatórios</h2>

      {loading ? (
        <div className="text-center text-gray-500">Carregando…</div>
      ) : days.length === 0 ? (
        <div className="text-center text-gray-500">Nenhuma movimentação.</div>
      ) : days.map(day => (
        <div key={day} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            {format(new Date(day), 'dd/MM/yyyy')}
          </h3>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Hora','Produto','Tipo','Qtd.','Usuário'].map(h=>(
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {byDay[day].map(mv => (
                  <tr key={mv._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {format(new Date(mv.date), 'HH:mm')}
                    </td>
                    <td className="px-4 py-2 text-sm">{mv.product.name}</td>
                    <td className="px-4 py-2 text-sm">{mv.type}</td>
                    <td className="px-4 py-2 text-sm">{mv.amount}</td>
                    <td className="px-4 py-2 text-sm">{mv.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
