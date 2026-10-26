import Transaction from '../models/Transaction.js';
import { isMongoActive, loadLocalDb } from '../config/localDb.js';

// @desc    Get dashboard summary, cards calculations, charts, and recent transactions
// @route   GET /api/dashboard/summary
export const getDashboardSummary = async (req, res, next) => {
  try {
    let transactions = [];

    if (isMongoActive()) {
      transactions = await Transaction.find().sort({ date: -1 });
    } else {
      const db = loadLocalDb();
      transactions = [...db.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // 1. Calculate overall totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;

    const categoryExpenseMap = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;

      if (tx.type === 'Income') {
        totalIncome += amt;
        if (isCurrentMonth) {
          currentMonthIncome += amt;
        }
      } else if (tx.type === 'Expense') {
        totalExpenses += amt;
        if (isCurrentMonth) {
          currentMonthExpenses += amt;
        }

        categoryExpenseMap[tx.category] = (categoryExpenseMap[tx.category] || 0) + amt;
      }
    });

    const currentBalance = totalIncome - totalExpenses;
    const monthlySavings = currentMonthIncome - currentMonthExpenses;

    // 2. Category Pie Chart Data (expenses only)
    const categoryExpensesChart = Object.entries(categoryExpenseMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? Number(((value / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // 3. Monthly Income vs Expenses Bar Chart Data (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyComparison = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const yr = d.getFullYear();
      const m = d.getMonth();
      const monthLabel = `${monthNames[m]} ${yr.toString().slice(-2)}`;

      let monthInc = 0;
      let monthExp = 0;

      transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        if (txDate.getFullYear() === yr && txDate.getMonth() === m) {
          if (tx.type === 'Income') monthInc += Number(tx.amount);
          if (tx.type === 'Expense') monthExp += Number(tx.amount);
        }
      });

      monthlyComparison.push({
        month: monthLabel,
        income: monthInc,
        expense: monthExp,
        savings: monthInc - monthExp,
      });
    }

    // 4. Daily Spending Trends Line Chart Data for Current Month
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const trendMap = {};

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      trendMap[day] = 0;
    }

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth && tx.type === 'Expense') {
        const day = txDate.getDate();
        trendMap[day] = (trendMap[day] || 0) + Number(tx.amount);
      }
    });

    const spendingTrends = Object.entries(trendMap).map(([day, amount]) => ({
      date: `Day ${day}`,
      day: Number(day),
      expense: amount,
    }));

    // 5. Recent 5 Transactions
    const recentTransactions = transactions.slice(0, 5);

    res.status(200).json({
      success: true,
      isMongo: isMongoActive(),
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          currentBalance,
          monthlySavings,
          currentMonthIncome,
          currentMonthExpenses,
        },
        charts: {
          categoryExpenses: categoryExpensesChart,
          monthlyComparison,
          spendingTrends,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
