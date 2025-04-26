// backend/routes/stock.js
import express from 'express';
import Product from '../models/Product.js';
const router = express.Router();

// GET /api/stock — lista todos os produtos com quantidade
router.get('/', async (req, res) => {
  try {
    const all = await Product.find().populate('group');
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

// POST /api/stock/:id/adjust — faz entrada ou saída
router.post('/:id/adjust', async (req, res) => {
  const { id } = req.params;
  const { type, amount } = req.body;

  try {
    const prod = await Product.findById(id);
    if (!prod) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (type === 'Entrada') {
      prod.stock += amount;
    } else {
      // aceita “Saída” ou “Saida”
      prod.stock -= amount;
    }

    if (prod.stock < 0) prod.stock = 0;

    await prod.save();
    return res.json(prod);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao ajustar estoque' });
  }
});

export default router;
