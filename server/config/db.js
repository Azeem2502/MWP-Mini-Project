import mongoose from 'mongoose';

let isConnected = false;
let connectionError = null;

// Disable buffering so Mongoose never hangs requests when disconnected
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';

  try {
    console.log(`[MongoDB] Attempting to connect to: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    connectionError = null;

    console.log(`====================================================`);
    console.log(`✅ [MongoDB] Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`====================================================`);

    return conn;
  } catch (error) {
    isConnected = false;
    connectionError = error.message;

    console.warn(`====================================================`);
    console.warn(`⚠️ [MongoDB Connection Warning]`);
    console.warn(`Could not connect to MongoDB at: ${uri}`);
    console.warn(`Reason: ${error.message}`);
    console.warn(``);
    console.warn(`QUICK SETUP STEPS FOR MONGODB:`);
    console.warn(`1. Local MongoDB:`);
    console.warn(`   Download & install MongoDB Community Server from:`);
    console.warn(`   https://www.mongodb.com/try/download/community`);
    console.warn(`   Then start the service via command prompt: net start MongoDB`);
    console.warn(`   OR`);
    console.warn(`2. Free Cloud Database (MongoDB Atlas):`);
    console.warn(`   Create a free cluster at https://www.mongodb.com/atlas`);
    console.warn(`   Copy your connection string and add to server/.env:`);
    console.warn(`   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense_tracker?retryWrites=true&w=majority`);
    console.warn(`====================================================`);

    return null;
  }
};

export const getDbStatus = () => {
  const state = mongoose.connection.readyState;
  return {
    connected: state === 1,
    readyState: state, // 0 = disconnected, 1 = connected, 2 = connecting
    host: mongoose.connection?.host || 'none',
    name: mongoose.connection?.name || 'none',
    error: connectionError,
    uri: process.env.MONGO_URI ? 'Configured in .env' : 'mongodb://127.0.0.1:27017/expense_tracker (default)',
  };
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
