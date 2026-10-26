import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { isMongoActive, loadLocalDb, saveLocalDb } from '../config/localDb.js';

// @desc    Get budgets with actual spending calculations for a month/year
// @route   GET /api/budgets
export const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1; // 1-12
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    let budgets = [];
    let monthlyExpenses = [];

    if (isMongoActive()) {
      budgets = await Budget.find({ month, year });

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      monthlyExpenses = await Transaction.find({
        type: 'Expense',
        date: { $gte: startDate, $lte: endDate },
      });
    } else {
      const db = loadLocalDb();
      budgets = (db.budgets || []).filter((b) => b.month === month && b.year === year);

      const start = new Date(year, month - 1, 1).getTime();
      const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();

      monthlyExpenses = (db.transactions || []).filter((tx) => {
        const t = new Date(tx.date).getTime();
        return tx.type === 'Expense' && t >= start && t <= end;
      });
    }

    // Compute spending per category
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

    res.status(200).json({
      success: true,
      isMongo: isMongoActive(),
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
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget
// @route   POST /api/budgets
export const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select a category' });
    }
    if (monthlyLimit === undefined || Number(monthlyLimit) < 0) {
      return res.status(400).json({ success: false, message: 'Budget limit must be zero or positive' });
    }

    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    if (isMongoActive()) {
      const budget = await Budget.findOneAndUpdate(
        { category: category.trim(), month: targetMonth, year: targetYear },
        { monthlyLimit: Number(monthlyLimit), category: category.trim(), month: targetMonth, year: targetYear },
        { new: true, upsert: true, runValidators: true }
      );
      return res.status(201).json({ success: true, message: 'Budget saved successfully', isMongo: true, data: budget });
    }

    // Local DB upsert
    const db = loadLocalDb();
    if (!db.budgets) db.budgets = [];

    const existingIndex = db.budgets.findIndex(
      (b) => b.category === category.trim() && b.month === targetMonth && b.year === targetYear
    );

    let saved;
    if (existingIndex >= 0) {
      db.budgets[existingIndex].monthlyLimit = Number(monthlyLimit);
      saved = db.budgets[existingIndex];
    } else {
      saved = {
        _id: 'bg_' + Date.now(),
        category: category.trim(),
        monthlyLimit: Number(monthlyLimit),
        month: targetMonth,
        year: targetYear,
        createdAt: new Date().toISOString(),
      };
      db.budgets.push(saved);
    }

    saveLocalDb(db);

    res.status(201).json({
      success: true,
      message: 'Budget saved successfully',
      isMongo: false,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a specific budget by ID
// @route   PUT /api/budgets/:id
export const updateBudget = async (req, res, next) => {
  try {
    const { monthlyLimit, category } = req.body;

    if (isMongoActive()) {
      const budget = await Budget.findById(req.params.id);
      if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }
      if (monthlyLimit !== undefined) budget.monthlyLimit = Number(monthlyLimit);
      if (category) budget.category = category.trim();
      const updated = await budget.save();
      return res.status(200).json({ success: true, message: 'Budget updated successfully', isMongo: true, data: updated });
    }

    const db = loadLocalDb();
    const b = (db.budgets || []).find((x) => String(x._id) === String(req.params.id));
    if (!b) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    if (monthlyLimit !== undefined) b.monthlyLimit = Number(monthlyLimit);
    if (category) b.category = category.trim();
    saveLocalDb(db);

    res.status(200).json({ success: true, message: 'Budget updated successfully', isMongo: false, data: b });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget by ID
// @route   DELETE /api/budgets/:id
export const deleteBudget = async (req, res, next) => {
  try {
    if (isMongoActive()) {
      const budget = await Budget.findById(req.params.id);
      if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }
      await budget.deleteOne();
      return res.status(200).json({ success: true, message: 'Budget deleted successfully', isMongo: true, data: { id: req.params.id } });
    }

    const db = loadLocalDb();
    const initialLen = (db.budgets || []).length;
    db.budgets = (db.budgets || []).filter((x) => String(x._id) !== String(req.params.id));

    if (db.budgets.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    saveLocalDb(db);

    res.status(200).json({ success: true, message: 'Budget deleted successfully', isMongo: false, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};
