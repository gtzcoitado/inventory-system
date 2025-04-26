import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// listar usuários (populando role)
router.get('/', async (_, res) => {
  const users = await User.find().populate('role');
  res.json(users);
});

// criar usuário
router.post('/', async (req, res) => {
    const { name, password, role, shift, sector } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, password: hash, role, shift, sector });
    await user.save();
    res.status(201).json(await user.populate('role'));
  });

// remover usuário
router.delete('/:id', async (req, res) => {
  await User.findByIdAndRemove(req.params.id);
  res.sendStatus(204);
});

export default router;
