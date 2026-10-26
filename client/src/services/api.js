// ============================================================================
// Direct Browser Storage Engine (GitHub & Production Ready)
// Runs 100% directly in the browser using localStorage.
// No localhost backend or MongoDB server required.
// ============================================================================

const TX_STORAGE_KEY = 'expense_tracker_transactions_v2';
const BG_STORAGE_KEY = 'expense_tracker_budgets_v2';

// Realistic sample transactions for demonstration
const getDefaultTransactions = () => {
  const now = new Date();
  const yr = now.getFullYear();
  const m = now.getMonth();

  return [
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
      description: 'Weekly vegetables, milk, and snacks',
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
      description: 'Monthly accommodation and room maintenance',
      createdAt: new Date().toISOString(),
    },
    // Previous month records for historical trends
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
      title: 'Previous Month Mess Bill',
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
      description: 'Train ticket home for weekend',
      createdAt: new Date().toISOString(),
    },
  ];
};

const getDefaultBudgets = () => {
  const now = new Date();
  const yr = now.getFullYear();
  const m = now.getMonth();

  return [
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
  ];
};

// Storage helper functions
const getStoredTransactions = () => {
  const data = localStorage.getItem(TX_STORAGE_KEY);
  if (!data) {
    const defaults = getDefaultTransactions();
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const setStoredTransactions = (transactions) => {
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
  window.dispatchEvent(new Event('expense-tracker-updated'));
};

const getStoredBudgets = () => {
  const data = localStorage.getItem(BG_STORAGE_KEY);
  if (!data) {
    const defaults = getDefaultBudgets();
    localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const setStoredBudgets = (budgets) => {
  localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(budgets));
};

// ============================================================================
// Public API Methods (Matching Express backend contract for 100% compatibility)
// ============================================================================

// 1. Transactions API
export const fetchTransactions = async (params = {}) => {
  const { search, type, category, startDate, endDate, sortBy, sortOrder } = params;
  let list = [...getStoredTransactions()];

  if (search && search.trim() !== '') {
    const term = search.trim().toLowerCase();
    list = list.filter((tx) => (tx.title || '').toLowerCase().includes(term));
  }
  if (type && type !== 'All') {
    list = list.filter((tx) => tx.type === type);
  }
  if (category && category !== 'All') {
    list = list.filter((tx) => tx.category === category);
  }
  if (startDate) {
    const start = new Date(startDate).getTime();
    list = list.filter((tx) => new Date(tx.date).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    list = list.filter((tx) => new Date(tx.date).getTime() <= end.getTime());
  }

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return {
    success: true,
    count: list.length,
    isDirect: true,
    data: list,
  };
};

export const fetchTransactionById = async (id) => {
  const list = getStoredTransactions();
  const tx = list.find((t) => String(t._id) === String(id));
  if (!tx) {
    return { success: false, message: 'Transaction not found' };
  }
  return { success: true, data: tx };
};

export const createTransaction = async (transactionData) => {
  const list = getStoredTransactions();
  const newTx = {
    _id: 'tx_' + Date.now(),
    title: (transactionData.title || '').trim(),
    amount: Number(transactionData.amount),
    type: transactionData.type || 'Expense',
    category: (transactionData.category || '').trim(),
    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString(),
    paymentMethod: transactionData.paymentMethod || 'Cash',
    description: (transactionData.description || '').trim(),
    createdAt: new Date().toISOString(),
  };

  list.unshift(newTx);
  setStoredTransactions(list);

  return {
    success: true,
    message: 'Transaction saved successfully',
    data: newTx,
  };
};

export const updateTransaction = async (id, transactionData) => {
  const list = getStoredTransactions();
  const index = list.findIndex((t) => String(t._id) === String(id));
  if (index === -1) {
    return { success: false, message: 'Transaction not found' };
  }

  list[index] = {
    ...list[index],
    title: transactionData.title !== undefined ? transactionData.title.trim() : list[index].title,
    amount: transactionData.amount !== undefined ? Number(transactionData.amount) : list[index].amount,
    type: transactionData.type !== undefined ? transactionData.type : list[index].type,
    category: transactionData.category !== undefined ? transactionData.category.trim() : list[index].category,
    date: transactionData.date !== undefined ? new Date(transactionData.date).toISOString() : list[index].date,
    paymentMethod: transactionData.paymentMethod !== undefined ? transactionData.paymentMethod : list[index].paymentMethod,
    description: transactionData.description !== undefined ? transactionData.description.trim() : list[index].description,
    updatedAt: new Date().toISOString(),
  };

  setStoredTransactions(list);

  return {
    success: true,
    message: 'Transaction updated successfully',
    data: list[index],
  };
};

export const deleteTransaction = async (id) => {
  const list = getStoredTransactions();
  const filtered = list.filter((t) => String(t._id) !== String(id));
  setStoredTransactions(filtered);

  return {
    success: true,
    message: 'Transaction deleted successfully',
    data: { id },
  };
};

// 2. Dashboard API
export const fetchDashboardSummary = async () => {
  const transactions = [...getStoredTransactions()].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let totalIncome = 0;
  let totalExpenses = 0;
  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;

  const categoryExpenseMap = {};

  transactions.forEach((tx) => {
    const amt = Number(tx.amount);
    const txDate = new Date(tx.date);
    const isCurrentMonth =
      txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;

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

  // Category Pie Chart
  const categoryExpensesChart = Object.entries(categoryExpenseMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? Number(((value / totalExpenses) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // 6-Month Comparison Bar Chart
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

  // Daily Spending Trend Line Chart
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const trendMap = {};
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    trendMap[day] = 0;
  }

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (
      txDate.getFullYear() === currentYear &&
      txDate.getMonth() === currentMonth &&
      tx.type === 'Expense'
    ) {
      const day = txDate.getDate();
      trendMap[day] = (trendMap[day] || 0) + Number(tx.amount);
    }
  });

  const spendingTrends = Object.entries(trendMap).map(([day, amount]) => ({
    date: `Day ${day}`,
    day: Number(day),
    expense: amount,
  }));

  // Recent 5 Transactions
  const recentTransactions = transactions.slice(0, 5);

  return {
    success: true,
    isDirect: true,
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
  };
};

// 3. Budgets API
export const fetchBudgets = async (params = {}) => {
  const now = new Date();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const year = params.year ? Number(params.year) : now.getFullYear();

  const allBudgets = getStoredBudgets();
  const budgets = allBudgets.filter((b) => Number(b.month) === month && Number(b.year) === year);

  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();

  const monthlyExpenses = getStoredTransactions().filter((tx) => {
    const t = new Date(tx.date).getTime();
    return tx.type === 'Expense' && t >= start && t <= end;
  });

  const spendingByCategory = {};
  let totalSpentThisMonth = 0;

  monthlyExpenses.forEach((tx) => {
    const amt = Number(tx.amount);
    totalSpentThisMonth += amt;
    spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + amt;
  });

  let totalBudgetLimit = 0;

  const augmentedBudgets = budgets.map((b) => {
    const spent = b.category === 'Total' ? totalSpentThisMonth : (spendingByCategory[b.category] || 0);
    const remaining = b.monthlyLimit - spent;
    const percentUsed = b.monthlyLimit > 0 ? Number(((spent / b.monthlyLimit) * 100).toFixed(1)) : 0;

    let status = 'normal';
    if (percentUsed > 100) {
      status = 'exceeded';
    } else if (percentUsed >= 80) {
      status = 'warning';
    }

    if (b.category !== 'Total') {
      totalBudgetLimit += b.monthlyLimit;
    }

    return {
      _id: b._id,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      month: b.month,
      year: b.year,
      spent,
      remaining,
      percentUsed,
      status,
      createdAt: b.createdAt,
    };
  });

  const explicitTotal = augmentedBudgets.find((b) => b.category === 'Total');
  const overallLimit = explicitTotal ? explicitTotal.monthlyLimit : totalBudgetLimit;
  const overallSpent = totalSpentThisMonth;
  const overallRemaining = overallLimit - overallSpent;
  const overallPercent = overallLimit > 0 ? Number(((overallSpent / overallLimit) * 100).toFixed(1)) : 0;

  return {
    success: true,
    isDirect: true,
    data: {
      month,
      year,
      overall: {
        limit: overallLimit,
        spent: overallSpent,
        remaining: overallRemaining,
        percentUsed: overallPercent,
        status: overallPercent > 100 ? 'exceeded' : overallPercent >= 80 ? 'warning' : 'normal',
      },
      budgets: augmentedBudgets,
    },
  };
};

export const saveBudget = async (budgetData) => {
  const { category, monthlyLimit, month, year } = budgetData;
  const allBudgets = getStoredBudgets();

  const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
  const targetYear = year ? Number(year) : new Date().getFullYear();

  const existingIndex = allBudgets.findIndex(
    (b) => b.category === category.trim() && Number(b.month) === targetMonth && Number(b.year) === targetYear
  );

  let saved;
  if (existingIndex >= 0) {
    allBudgets[existingIndex].monthlyLimit = Number(monthlyLimit);
    saved = allBudgets[existingIndex];
  } else {
    saved = {
      _id: 'bg_' + Date.now(),
      category: category.trim(),
      monthlyLimit: Number(monthlyLimit),
      month: targetMonth,
      year: targetYear,
      createdAt: new Date().toISOString(),
    };
    allBudgets.push(saved);
  }

  setStoredBudgets(allBudgets);

  return {
    success: true,
    message: 'Budget saved successfully',
    data: saved,
  };
};

export const updateBudget = async (id, budgetData) => {
  const allBudgets = getStoredBudgets();
  const b = allBudgets.find((x) => String(x._id) === String(id));
  if (!b) {
    return { success: false, message: 'Budget not found' };
  }
  if (budgetData.monthlyLimit !== undefined) b.monthlyLimit = Number(budgetData.monthlyLimit);
  if (budgetData.category) b.category = budgetData.category.trim();

  setStoredBudgets(allBudgets);

  return {
    success: true,
    message: 'Budget updated successfully',
    data: b,
  };
};

export const deleteBudget = async (id) => {
  const allBudgets = getStoredBudgets();
  const filtered = allBudgets.filter((x) => String(x._id) !== String(id));
  setStoredBudgets(filtered);

  return {
    success: true,
    message: 'Budget deleted successfully',
    data: { id },
  };
};

// 4. Reports API
export const fetchReportsAnalytics = async (params = {}) => {
  const { month, year } = params;
  let transactions = getStoredTransactions();

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

  return {
    success: true,
    isDirect: true,
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
  };
};

// 5. Seed & Database Management
export const seedSampleData = async () => {
  const sampleTransactions = getDefaultTransactions();
  const sampleBudgets = getDefaultBudgets();

  setStoredTransactions(sampleTransactions);
  setStoredBudgets(sampleBudgets);

  return {
    success: true,
    message: `Successfully loaded ${sampleTransactions.length} sample transactions and ${sampleBudgets.length} budgets!`,
  };
};

export const clearAllData = async () => {
  setStoredTransactions([]);
  setStoredBudgets([]);

  return {
    success: true,
    message: 'All transactions and budgets have been cleared successfully.',
  };
};

export const checkServerHealth = async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: true,
      isDirect: true,
      host: 'Browser LocalStorage',
      name: 'expense_tracker_db',
      uri: 'Direct Client-Side Storage (No Localhost Required)',
    },
  };
};

export default {
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchDashboardSummary,
  fetchBudgets,
  saveBudget,
  updateBudget,
  deleteBudget,
  fetchReportsAnalytics,
  seedSampleData,
  clearAllData,
  checkServerHealth,
};
