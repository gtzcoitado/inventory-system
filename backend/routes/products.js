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
  const { name, group } = req.body;
  const product = new Product({ name, group });
  await product.save();
  res.status(201).json(await product.populate('group'));
});

// editar produto
router.put('/:id', async (req, res) => {
  const { name, group } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, group },
    { new: true }
  ).populate('group');
  res.json(product);
});

// remover produto
router.delete('/:id', async (req, res) => {
  await Product.findByIdAndRemove(req.params.id);
  res.sendStatus(204);
});

export default router;
