// backend/models/Role.js
import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: {
    type: [String],
    enum: ['Admin','Estoque','Produtos','Grupos','Checklist','Funções','Usuários'],
    default: []
  },
  defaultRoute: {
    type: String,
    enum: ['/', '/products', '/groups', '/checklists', '/roles', '/users'],
    default: '/'
  }
});

export default mongoose.model('Role', roleSchema);
