import express from 'express';
import User    from '../models/User.js';
import bcrypt  from 'bcrypt';
import jwt     from 'jsonwebtoken';
const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name }).populate('role');
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({
    token,
    user: {
      id:     user._id,
      name:   user.name,
      shift:  user.shift,
      sector: user.sector,
      role:   user.role
    }
  });
});

export default router;
