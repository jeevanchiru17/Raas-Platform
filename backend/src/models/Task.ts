import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  id: string;
  name: string;
  robotId: string;
  priority: string;
  dueDate: string;
  status: string;
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  robotId: { type: String, default: 'unassigned' },
  priority: { type: String, default: 'medium' },
  dueDate: { type: String, default: 'ASAP' },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITask>('Task', TaskSchema);
