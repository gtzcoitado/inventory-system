// backend/routes/roles.js
import express from 'express';
import Role    from '../models/Role.js';
const router = express.Router();

// Listar todas as funções
router.get('/', async (_, res) => {
  const roles = await Role.find();
  res.json(roles);
});

// Criar função (aceita name, permissions e defaultRoute)
router.post('/', async (req, res) => {
  const { name, permissions, defaultRoute } = req.body;
  const role = new Role({ name, permissions, defaultRoute });
  await role.save();
  res.status(201).json(role);
});

// Atualizar função
router.put('/:id', async (req, res) => {
  const { name, permissions, defaultRoute } = req.body;
  const updated = await Role.findByIdAndUpdate(
    req.params.id,
    { name, permissions, defaultRoute },
    { new: true }
  );
  res.json(updated);
});

// Remover função
router.delete('/:id', async (req, res) => {
  await Role.findByIdAndRemove(req.params.id);
  res.sendStatus(204);
});

export default router;
