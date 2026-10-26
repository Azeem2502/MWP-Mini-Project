import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate realistic initial demo transactions
const getInitialData = () => {
  const now = new Date();
  const yr = now.getFullYear();
  const m = now.getMonth();

  return {
    transactions: [
      {
        _id: 'tx_seed_1',
        title: 'Monthly Salary',
        amount: 25000,
        type: 'Income',
        category: 'Salary',
        date: new Date(yr, m, 1).toISOString(),
        paymentMethod: 'Bank Transfer',
        description: 'Monthly college stipend / part-time salary',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_2',
        title: 'Freelance Project',
        amount: 5000,
        type: 'Income',
        category: 'Freelance',
        date: new Date(yr, m, 5).toISOString(),
        paymentMethod: 'UPI',
        description: 'Frontend landing page redesign',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_3',
        title: 'Groceries',
        amount: 2000,
        type: 'Expense',
        category: 'Food',
        date: new Date(yr, m, 3).toISOString(),
        paymentMethod: 'UPI',
        description: 'Weekly vegetables and snacks',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_4',
        title: 'College Expenses',
        amount: 1500,
        type: 'Expense',
        category: 'Education',
        date: new Date(yr, m, 6).toISOString(),
        paymentMethod: 'Debit Card',
        description: 'Project materials and reference books',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_5',
        title: 'Transportation',
        amount: 800,
        type: 'Expense',
        category: 'Transportation',
        date: new Date(yr, m, 8).toISOString(),
        paymentMethod: 'Cash',
        description: 'Monthly metro pass recharge',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_6',
        title: 'Internet Bill',
        amount: 999,
        type: 'Expense',
        category: 'Bills and Utilities',
        date: new Date(yr, m, 10).toISOString(),
        paymentMethod: 'UPI',
        description: 'Broadband fiber monthly bill',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_7',
        title: 'Hostel Rent Share',
        amount: 4500,
        type: 'Expense',
        category: 'Rent',
        date: new Date(yr, m, 2).toISOString(),
        paymentMethod: 'Bank Transfer',
        description: 'Monthly accommodation',
        createdAt: new Date().toISOString(),
      },
      // Previous month records for 6-month comparison
      {
        _id: 'tx_seed_8',
        title: 'Previous Month Salary',
        amount: 25000,
        type: 'Income',
        category: 'Salary',
        date: new Date(yr, m - 1, 1).toISOString(),
        paymentMethod: 'Bank Transfer',
        description: 'Stipend',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_9',
        title: 'Previous Month Food',
        amount: 3200,
        type: 'Expense',
        category: 'Food',
        date: new Date(yr, m - 1, 15).toISOString(),
        paymentMethod: 'UPI',
        description: 'Mess bill and canteen',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'tx_seed_10',
        title: 'Previous Month Travel',
        amount: 750,
        type: 'Expense',
        category: 'Transportation',
        date: new Date(yr, m - 1, 20).toISOString(),
        paymentMethod: 'Cash',
        description: 'Travel expenses',
        createdAt: new Date().toISOString(),
      },
    ],
    budgets: [
      {
        _id: 'bg_seed_1',
        category: 'Total',
        monthlyLimit: 15000,
        month: m + 1,
        year: yr,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'bg_seed_2',
        category: 'Food',
        monthlyLimit: 4000,
        month: m + 1,
        year: yr,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'bg_seed_3',
        category: 'Education',
        monthlyLimit: 2000,
        month: m + 1,
        year: yr,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'bg_seed_4',
        category: 'Transportation',
        monthlyLimit: 1200,
        month: m + 1,
        year: yr,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'bg_seed_5',
        category: 'Bills and Utilities',
        monthlyLimit: 1500,
        month: m + 1,
        year: yr,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'bg_seed_6',
        category: 'Rent',
        monthlyLimit: 5000,
        month: m + 1,
        year: yr,
        createdAt: new Date().toISOString(),
      },
    ],
  };
};

export const loadLocalDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[LocalDB] Read error, resetting:', err.message);
    const initial = getInitialData();
    return initial;
  }
};

export const saveLocalDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LocalDB] Write error:', err.message);
  }
};

export const isMongoActive = () => {
  return mongoose.connection.readyState === 1;
};
