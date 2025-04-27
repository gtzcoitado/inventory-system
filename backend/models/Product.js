// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  stock: { type: Number, default: 0 },
  // new fields:
  lastUpdatedAt: { type: Date },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Product', productSchema);
