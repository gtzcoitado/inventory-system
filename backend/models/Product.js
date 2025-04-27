import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name:       String,
  stock:      { type: Number, default: 0 },
  minStock:   { type: Number, default: 0 },
  group:      { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  // ↓↓↓ campos novos ↓↓↓
  lastUpdatedAt:   { type: Date },
  lastUpdatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Product', ProductSchema);
