import express from 'express';
import Product from '../models/Product.js';
const router = express.Router();

// GET /api/stock — já traz os campos renomeados para o frontend
router.get('/', async (req, res) => {
  try {
    const all = await Product.find()
      .populate('group')
      .populate('lastUpdatedBy', 'name');
    
    // renomeia lastUpdatedAt → updatedAt e lastUpdatedBy → updatedBy
    const result = all.map(prod => {
      const obj = prod.toObject();
      obj.updatedAt  = obj.lastUpdatedAt;
      obj.updatedBy  = obj.lastUpdatedBy?.name || null;
      return obj;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

// POST /api/stock/:id/adjust — agora aceita userId no body como fallback
router.post('/:id/adjust', async (req, res) => {
  const { id } = req.params;
  const { type, amount, userId } = req.body;

  try {
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });

    // ajusta estoque
    if (type === 'Entrada') prod.stock += amount;
    else                     prod.stock = Math.max(0, prod.stock - amount);

    // grava timestamp e usuário (usa req.user se existir, senão userId)
    prod.lastUpdatedAt   = new Date();
    prod.lastUpdatedBy   = req.user?._id || userId;

    await prod.save();

    // re-fetch para popular group e lastUpdatedBy.name
    const updatedLong = await Product.findById(id)
      .populate('group')
      .populate('lastUpdatedBy', 'name');

    // ajusta campos pra frontend
    const updated = updatedLong.toObject();
    updated.updatedAt = updated.lastUpdatedAt;
    updated.updatedBy = updated.lastUpdatedBy?.name || null;

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao ajustar estoque' });
  }
});

export default router;
