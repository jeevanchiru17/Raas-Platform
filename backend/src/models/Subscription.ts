import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  plan: string;
  credits: number;
  creditsUsed: number;
  robots: number;
  robotsLimit: number;
  stripeCustomerId: string | null;
  features: string[];
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  plan: { type: String, default: 'free' },
  credits: { type: Number, default: 100 },
  creditsUsed: { type: Number, default: 25 },
  robots: { type: Number, default: 1 },
  robotsLimit: { type: Number, default: 10 },
  stripeCustomerId: { type: String, default: null },
  features: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
