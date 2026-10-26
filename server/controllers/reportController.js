import Transaction from '../models/Transaction.js';
import { isMongoActive, loadLocalDb } from '../config/localDb.js';

// @desc    Get detailed reports and analytics for a selected month/year or all-time
// @route   GET /api/reports/analytics
export const getReportsAnalytics = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    let transactions = [];

    if (isMongoActive()) {
      const query = {};

      if (year && year !== 'All') {
        const targetYear = Number(year);
        let startDate, endDate;

        if (month && month !== 'All') {
          const targetMonth = Number(month);
          startDate = new Date(targetYear, targetMonth - 1, 1);
          endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
        } else {
          startDate = new Date(targetYear, 0, 1);
          endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        }

        query.date = { $gte: startDate, $lte: endDate };
      }

      transactions = await Transaction.find(query).sort({ date: -1 });
    } else {
      const db = loadLocalDb();
      transactions = [...db.transactions];

      if (year && year !== 'All') {
        const targetYear = Number(year);
        if (month && month !== 'All') {
          const targetMonth = Number(month);
          const start = new Date(targetYear, targetMonth - 1, 1).getTime();
          const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999).getTime();
          transactions = transactions.filter((tx) => {
            const t = new Date(tx.date).getTime();
            return t >= start && t <= end;
          });
        } else {
          const start = new Date(targetYear, 0, 1).getTime();
          const end = new Date(targetYear, 11, 31, 23, 59, 59, 999).getTime();
          transactions = transactions.filter((tx) => {
            const t = new Date(tx.date).getTime();
            return t >= start && t <= end;
          });
        }
      }
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenseMap = {};
    const paymentMethodMap = {};
    const monthlyComparisonMap = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      const txDate = new Date(tx.date);
      const mKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyComparisonMap[mKey]) {
        monthlyComparisonMap[mKey] = {
          month: mKey,
          income: 0,
          expense: 0,
        };
      }

      if (tx.type === 'Income') {
        totalIncome += amt;
        monthlyComparisonMap[mKey].income += amt;
      } else if (tx.type === 'Expense') {
        totalExpenses += amt;
        monthlyComparisonMap[mKey].expense += amt;
        categoryExpenseMap[tx.category] = (categoryExpenseMap[tx.category] || 0) + amt;
      }

      paymentMethodMap[tx.paymentMethod] = (paymentMethodMap[tx.paymentMethod] || 0) + amt;
    });

    const netSavings = totalIncome - totalExpenses;

    const categoryBreakdown = Object.entries(categoryExpenseMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const highestSpendingCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    const monthlyTrends = Object.values(monthlyComparisonMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        savings: item.income - item.expense,
      }));

    const paymentMethods = Object.entries(paymentMethodMap).map(([method, amount]) => ({
      method,
      amount,
    }));

    res.status(200).json({
      success: true,
      isMongo: isMongoActive(),
      data: {
        totalIncome,
        totalExpenses,
        netSavings,
        highestSpendingCategory,
        categoryBreakdown,
        monthlyTrends,
        paymentMethods,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
