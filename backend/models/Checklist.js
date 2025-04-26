import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const checklistSchema = new mongoose.Schema({
  shift:  { type: String, enum: ['Manha','Noite'], required: true },
  sector: { type: String, enum: ['Cozinha','Salão','Pizza','Churrasqueira'], required: true },
  tasks:  [ taskSchema ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Checklist', checklistSchema);
