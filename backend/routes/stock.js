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
      .populate('lastUpdatedBy', 'name');

    const result = all.map(p => {
      const o = p.toObject();
      return {
        _id:       o._id,
        name:      o.name,
        stock:     o.stock,
        minStock:  o.minStock,
        group:     o.group,
        // renomeia para o front
        updatedAt: o.lastUpdatedAt   || null,
        updatedBy: o.lastUpdatedBy?.name || '–'
      };
    });

    res.json(result);
  } catch (err) {
    console.error('GET /api/stock erro:', err);
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});


/**
 * POST /api/stock/:id/adjust
 * Ajusta o estoque e grava timestamp + quem fez
 * Recebe no body: { type: 'Entrada'|'Saida', amount: number, userId?: string }
 * Também aceita req.user._id, caso você tenha middleware JWT.
 */
router.post('/:id/adjust', async (req, res) => {
  const { id }      = req.params;
  const { type, amount, userId: bodyUserId } = req.body;

  // tenta pegar o usuário de req.user (se existir) ou do corpo da requisição
  const operatorId = req.user?._id || bodyUserId;
  if (!operatorId) {
    return res.status(400).json({ error: 'Identificação do usuário faltando' });
  }

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

    // grava audit fields
    prod.lastUpdatedAt = new Date();
    prod.lastUpdatedBy = operatorId;

    await prod.save();

    // re-fetch para popular referência e retornar apenas campos úteis
    const updated = await Product.findById(id)
      .populate('group')
      .populate('lastUpdatedBy', 'name');

    const o = updated.toObject();
    return res.json({
      _id:       o._id,
      name:      o.name,
      stock:     o.stock,
      minStock:  o.minStock,
      group:     o.group,
      updatedAt: o.lastUpdatedAt,
      updatedBy: o.lastUpdatedBy?.name || '–'
    });
  } catch (err) {
    console.error('POST /api/stock/:id/adjust erro:', err);
    res.status(500).json({ error: 'Erro ao ajustar estoque' });
  }
});

export default router;
