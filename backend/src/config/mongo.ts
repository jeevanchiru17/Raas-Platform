import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/raas-platform';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Quick timeout if local mongodb instance is not running
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error: any) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Connection Skipped (Using Local File Storage Fallback): ${error.message}`);
  }
};

export const isMongoConnected = (): boolean => isConnected;

export { mongoose };
