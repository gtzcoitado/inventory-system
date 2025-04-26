// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  group:     { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  stock:     { type: Number, default: 0 },
  minStock:  { type: Number, default: 0 },    // ← novo campo
});

export default mongoose.model('Product', productSchema);
