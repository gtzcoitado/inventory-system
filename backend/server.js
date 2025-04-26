import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error(err));

// rotas
import groupRoutes from './routes/groups.js';
import productRoutes from './routes/products.js';
import stockRoutes from './routes/stock.js';
import checklistRoutes from './routes/checklists.js';
import roleRoutes     from './routes/roles.js';
import userRoutes     from './routes/users.js';
import authRoutes     from './routes/auth.js';


app.use('/api/groups', groupRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/roles',      roleRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/auth',  authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
