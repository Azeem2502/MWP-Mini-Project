import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health and DB status check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount API routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Server] Initial DB connection attempt encountered error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Expense Tracker Server is running on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();
