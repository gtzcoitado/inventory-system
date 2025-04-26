import express from 'express';
import Group from '../models/Group.js';
const router = express.Router();

// listar todos os grupos
router.get('/', async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});

// criar grupo
router.post('/', async (req, res) => {
  const { name } = req.body;
  const group = new Group({ name });
  await group.save();
  res.status(201).json(group);
});

// editar grupo
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  const group = await Group.findByIdAndUpdate(req.params.id, { name }, { new: true });
  res.json(group);
});

// remover grupo
router.delete('/:id', async (req, res) => {
  await Group.findByIdAndRemove(req.params.id);
  res.sendStatus(204);
});

export default router;
