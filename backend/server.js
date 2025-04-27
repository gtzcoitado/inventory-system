import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Configura CORS para aceitar apenas o domínio do front e enviar credenciais
// Altere CLIENT_URL no .env para o domínio exato do frontend (e.g. https://inventory-system-production-7407.up.railway.app)
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsOptions));
// Habilita CORS em préflight também
app.options('*', cors(corsOptions));

// Parser de JSON
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Importa rotas
import groupRoutes from './routes/groups.js';
import productRoutes from './routes/products.js';
import stockRoutes from './routes/stock.js';
import checklistRoutes from './routes/checklists.js';
import roleRoutes from './routes/roles.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';

// Monta rotas
app.use('/api/groups', groupRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Health-check opcional
app.get('/health', (req, res) => res.send('OK'));

// Inicia servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));