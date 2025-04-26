import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  shift:    { type: String, enum: ['Manha','Noite'], required: true },
  sector:   {
    type: String,
    enum: ['Cozinha','Salão','Pizza','Churrasqueira'],
    required: true
  }
});

export default mongoose.model('User', userSchema);
