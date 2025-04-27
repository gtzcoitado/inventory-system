// backend/routes/stock.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * GET /api/stock
 * Retorna todos os produtos com grupo, última atualização e nome de quem atualizou
 */
router.get('/', async (req, res) => {
  try {
    const all = await Product.find()
      .populate('group')
      .populate('lastUpdatedBy', 'name');  // puxa apenas o campo name do usuário

    const result = all.map(p => {
      const o = p.toObject();
      return {
        _id:         o._id,
        name:        o.name,
        stock:       o.stock,
        minStock:    o.minStock,
        group:       o.group,
        updatedAt:   o.lastUpdatedAt   || null,
        updatedBy:   o.lastUpdatedBy?.name || '–',
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Erro ao buscar estoque:', err);
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

/**
 * POST /api/stock/:id/adjust
 * Ajusta o estoque de um produto (Entrada/Saída), grava timestamp e quem atualizou
 * Recebe no body: { type: 'Entrada' | 'Saida', amount: number, userId: string }
 */
router.post('/:id/adjust', async (req, res) => {
  const { id } = req.params;
  const { type, amount, userId } = req.body;

  try {
    const prod = await Product.findById(id);
    if (!prod) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // ajusta quantidade
    if (type === 'Entrada') {
      prod.stock += amount;
    } else {
      prod.stock = Math.max(0, prod.stock - amount);
    }

    // registra data e autor do ajuste
    prod.lastUpdatedAt = new Date();
    prod.lastUpdatedBy = userId;

    await prod.save();

    // re-fetch para popular referências
    const updated = await Product.findById(id)
      .populate('group')
      .populate('lastUpdatedBy', 'name');

    const o = updated.toObject();
    res.json({
      _id:         o._id,
      name:        o.name,
      stock:       o.stock,
      minStock:    o.minStock,
      group:       o.group,
      updatedAt:   o.lastUpdatedAt,
      updatedBy:   o.lastUpdatedBy?.name || '–',
    });
  } catch (err) {
    console.error('Erro ao ajustar estoque:', err);
    res.status(500).json({ error: 'Erro ao ajustar estoque' });
  }
});

export default router;
