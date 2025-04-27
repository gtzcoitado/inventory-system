import express from 'express';
import Product from '../models/Product.js';
const router = express.Router();

// GET /api/stock
router.get('/', async (req, res) => {
  try {
    const all = await Product.find()
      .populate('group')
      .populate('lastUpdatedBy', 'name');

    const result = all.map(p => {
      const o = p.toObject();
      return {
        ...o,
        updatedAt:  o.lastUpdatedAt,
        updatedBy:  o.lastUpdatedBy?.name || '–'
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

// POST /api/stock/:id/adjust
router.post('/:id/adjust', async (req, res) => {
  const { id } = req.params;
  const { type, amount, userId } = req.body;

  try {
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });

    prod.stock = type === 'Entrada'
      ? prod.stock + amount
      : Math.max(0, prod.stock - amount);

    prod.lastUpdatedAt = new Date();
    prod.lastUpdatedBy = userId;              // usa sempre o userId enviado

    await prod.save();

    const updated = await Product.findById(id)
      .populate('group')
      .populate('lastUpdatedBy', 'name');

    const o = updated.toObject();
    return res.json({
      ...o,
      updatedAt:  o.lastUpdatedAt,
      updatedBy:  o.lastUpdatedBy?.name || '–'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao ajustar estoque' });
  }
});

export default router;
