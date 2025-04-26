import express from 'express';
import Checklist from '../models/Checklist.js';
const router = express.Router();

// Listar todos os checklists
router.get('/', async (_, res) => {
  const all = await Checklist.find();
  res.json(all);
});

// Criar novo checklist (sem tarefas iniciais)
router.post('/', async (req, res) => {
  const { shift, sector } = req.body;
  const doc = new Checklist({ shift, sector, tasks: [] });
  await doc.save();
  res.status(201).json(doc);
});

// Remover checklist inteiro
router.delete('/:cid', async (req, res) => {
  await Checklist.findByIdAndRemove(req.params.cid);
  res.sendStatus(204);
});

// Adicionar tarefa
router.post('/:cid/tasks', async (req, res) => {
  const { cid } = req.params;
  const { text } = req.body;
  const doc = await Checklist.findById(cid);
  doc.tasks.push({ text });
  await doc.save();
  res.json(doc);
});

// Marcar/desmarcar tarefa
router.patch('/:cid/tasks/:tid', async (req, res) => {
  const { cid, tid } = req.params;
  const { done } = req.body;
  const doc = await Checklist.findOneAndUpdate(
    { _id: cid, 'tasks._id': tid },
    { $set: { 'tasks.$.done': done } },
    { new: true }
  );
  res.json(doc);
});

// **REMOVER TAREFA** (corrigido):
router.delete('/:cid/tasks/:tid', async (req, res) => {
  const { cid, tid } = req.params;
  try {
    const updated = await Checklist.findByIdAndUpdate(
      cid,
      { $pull: { tasks: { _id: tid } } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Checklist não encontrado' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Erro ao remover tarefa:', err);
    res.status(500).json({ error: 'Erro ao remover tarefa' });
  }
});

export default router;
