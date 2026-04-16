import mongoose from 'mongoose';
import env from './env';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for document operations
      socketTimeoutMS: 45000, // 45 second socket timeout for large operations
      maxPoolSize: 10, // Connection pool size
      bufferCommands: false // Disable command buffering
    });
    console.log('MongoDB connected');
  } catch (error) {
    // Don't throw - allow app to run without MongoDB for basic RAG functionality
    console.warn('MongoDB connection failed (app will continue without session persistence)');
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
  } catch (error) {
    // Silent disconnect
  }
}
