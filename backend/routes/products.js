import express from 'express';
import Product from '../models/Product.js';
const router = express.Router();

// listar produtos (com grupo populado)
router.get('/', async (req, res) => {
  const products = await Product.find().populate('group');
  res.json(products);
});

// criar produto
router.post('/', async (req, res) => {
  try {
    const { name, group, minStock } = req.body;
    const p = new Product({ name, group, minStock });    // ← inclui minStock
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// editar produto
router.put('/:id', async (req, res) => {
  try {
    const { name, group, minStock } = req.body;
    const p = await Product.findByIdAndUpdate(
      req.params.id,
      { name, group, minStock },        // ← inclui minStock
      { new: true }
    );
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;