import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  stock: { type: Number, default: 0 },
});

export default mongoose.model('Product', productSchema);
