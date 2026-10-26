import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

dotenv.config();

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed

export const sampleTransactions = [
  {
    title: 'Monthly Salary',
    amount: 25000,
    type: 'Income',
    category: 'Salary',
    date: new Date(currentYear, currentMonth, 1),
    paymentMethod: 'Bank Transfer',
    description: 'Monthly college stipend / part-time salary',
  },
  {
    title: 'Freelance Project',
    amount: 5000,
    type: 'Income',
    category: 'Freelance',
    date: new Date(currentYear, currentMonth, 5),
    paymentMethod: 'UPI',
    description: 'Frontend landing page redesign for client',
  },
  {
    title: 'Groceries',
    amount: 2000,
    type: 'Expense',
    category: 'Food',
    date: new Date(currentYear, currentMonth, 3),
    paymentMethod: 'UPI',
    description: 'Weekly vegetables, milk, and household snacks',
  },
  {
    title: 'College Expenses',
    amount: 1500,
    type: 'Expense',
    category: 'Education',
    date: new Date(currentYear, currentMonth, 6),
    paymentMethod: 'Debit Card',
    description: 'Semester project materials and reference textbooks',
  },
  {
    title: 'Transportation',
    amount: 800,
    type: 'Expense',
    category: 'Transportation',
    date: new Date(currentYear, currentMonth, 8),
    paymentMethod: 'Cash',
    description: 'Monthly metro pass recharge and bus fares',
  },
  {
    title: 'Internet Bill',
    amount: 999,
    type: 'Expense',
    category: 'Bills and Utilities',
    date: new Date(currentYear, currentMonth, 10),
    paymentMethod: 'UPI',
    description: 'High-speed broadband fiber monthly subscription',
  },
  {
    title: 'Weekend Dining',
    amount: 1200,
    type: 'Expense',
    category: 'Food',
    date: new Date(currentYear, currentMonth, 11),
    paymentMethod: 'UPI',
    description: 'Lunch with college project group',
  },
  {
    title: 'Hostel Rent Share',
    amount: 4500,
    type: 'Expense',
    category: 'Rent',
    date: new Date(currentYear, currentMonth, 2),
    paymentMethod: 'Bank Transfer',
    description: 'Monthly accommodation and room maintenance',
  },
  // Previous month data for comparison trends
  {
    title: 'Previous Month Salary',
    amount: 25000,
    type: 'Income',
    category: 'Salary',
    date: new Date(currentYear, currentMonth - 1, 1),
    paymentMethod: 'Bank Transfer',
    description: 'Stipend for previous month',
  },
  {
    title: 'Previous Month Food & Mess',
    amount: 3200,
    type: 'Expense',
    category: 'Food',
    date: new Date(currentYear, currentMonth - 1, 15),
    paymentMethod: 'UPI',
    description: 'Mess bill and canteen',
  },
  {
    title: 'Previous Month Travel',
    amount: 750,
    type: 'Expense',
    category: 'Transportation',
    date: new Date(currentYear, currentMonth - 1, 20),
    paymentMethod: 'Cash',
    description: 'Train ticket home for weekend',
  },
];

export const sampleBudgets = [
  {
    category: 'Total',
    monthlyLimit: 15000,
    month: currentMonth + 1,
    year: currentYear,
  },
  {
    category: 'Food',
    monthlyLimit: 4000,
    month: currentMonth + 1,
    year: currentYear,
  },
  {
    category: 'Education',
    monthlyLimit: 2000,
    month: currentMonth + 1,
    year: currentYear,
  },
  {
    category: 'Transportation',
    monthlyLimit: 1200,
    month: currentMonth + 1,
    year: currentYear,
  },
  {
    category: 'Bills and Utilities',
    monthlyLimit: 1500,
    month: currentMonth + 1,
    year: currentYear,
  },
  {
    category: 'Rent',
    monthlyLimit: 5000,
    month: currentMonth + 1,
    year: currentYear,
  },
];

const runSeed = async () => {
  try {
    await connectDB();

    const isClearOnly = process.argv.includes('--clear');

    if (isClearOnly) {
      await Transaction.deleteMany({});
      await Budget.deleteMany({});
      console.log('🧹 Successfully cleared all transactions and budgets from MongoDB!');
    } else {
      // Clear existing first to avoid duplicate seeds
      await Transaction.deleteMany({});
      await Budget.deleteMany({});

      await Transaction.insertMany(sampleTransactions);
      await Budget.insertMany(sampleBudgets);

      console.log(`✅ Seeded ${sampleTransactions.length} sample transactions and ${sampleBudgets.length} budgets successfully!`);
    }

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing seed script:', err.message);
    process.exit(1);
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
