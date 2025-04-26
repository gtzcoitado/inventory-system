import { useState } from 'react';
import axios from 'axios';

export default function StockAdjustModal({ product, onClose, onUpdated }) {
  const [amount, setAmount] = useState(0);

  const submit = async () => {
    await axios.patch(`http://localhost:4000/api/stock/${product._id}`, { adjustment: amount });
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="mb-4 font-semibold">Ajustar estoque: {product.name}</h2>
        <input
          type="number"
          className="w-full mb-4 p-2 border rounded"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2">Cancelar</button>
          <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
