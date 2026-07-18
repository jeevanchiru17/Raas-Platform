import mongoose, { Schema, Document } from 'mongoose';

export interface IRobot extends Document {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  battery: number;
  createdAt: Date;
}

const RobotSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, default: 'Warehouse Bay' },
  status: { type: String, default: 'online' },
  battery: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRobot>('Robot', RobotSchema);
