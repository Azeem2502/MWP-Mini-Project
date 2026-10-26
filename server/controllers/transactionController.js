import Transaction from '../models/Transaction.js';
import { isMongoActive, loadLocalDb, saveLocalDb } from '../config/localDb.js';

// @desc    Get all transactions with optional filters and sorting
// @route   GET /api/transactions
export const getTransactions = async (req, res, next) => {
  try {
    const { search, type, category, startDate, endDate, sortBy, sortOrder } = req.query;

    if (isMongoActive()) {
      const query = {};

      if (search && search.trim() !== '') {
        query.title = { $regex: search.trim(), $options: 'i' };
      }
      if (type && type !== 'All') {
        query.type = type;
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      const sortField = sortBy === 'amount' ? 'amount' : 'date';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const transactions = await Transaction.find(query).sort({ [sortField]: sortDirection });

      return res.status(200).json({
        success: true,
        count: transactions.length,
        isMongo: true,
        data: transactions,
      });
    }

    // Local DB fallback
    const db = loadLocalDb();
    let list = [...db.transactions];

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      list = list.filter((tx) => tx.title.toLowerCase().includes(term));
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

    res.status(200).json({
      success: true,
      count: list.length,
      isMongo: false,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
export const getTransactionById = async (req, res, next) => {
  try {
    if (isMongoActive()) {
      const transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      return res.status(200).json({ success: true, isMongo: true, data: transaction });
    }

    const db = loadLocalDb();
    const transaction = db.transactions.find((tx) => String(tx._id) === String(req.params.id));
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.status(200).json({ success: true, isMongo: false, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
export const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, paymentMethod, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a transaction title' });
    }
    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }
    if (!type || !['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either Income or Expense' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select a valid category' });
    }

    if (isMongoActive()) {
      const transaction = await Transaction.create({
        title: title.trim(),
        amount: Number(amount),
        type,
        category: category.trim(),
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || 'Cash',
        description: description ? description.trim() : '',
      });

      return res.status(201).json({
        success: true,
        message: 'Transaction created successfully in MongoDB',
        isMongo: true,
        data: transaction,
      });
    }

    // Local DB write
    const db = loadLocalDb();
    const newTx = {
      _id: 'tx_' + Date.now(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      paymentMethod: paymentMethod || 'Cash',
      description: description ? description.trim() : '',
      createdAt: new Date().toISOString(),
    };

    db.transactions.unshift(newTx);
    saveLocalDb(db);

    res.status(201).json({
      success: true,
      message: 'Transaction saved successfully',
      isMongo: false,
      data: newTx,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
export const updateTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, paymentMethod, description } = req.body;

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    if (isMongoActive()) {
      let transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      transaction.title = title !== undefined ? title.trim() : transaction.title;
      transaction.amount = amount !== undefined ? Number(amount) : transaction.amount;
      transaction.type = type !== undefined ? type : transaction.type;
      transaction.category = category !== undefined ? category.trim() : transaction.category;
      transaction.date = date !== undefined ? new Date(date) : transaction.date;
      transaction.paymentMethod = paymentMethod !== undefined ? paymentMethod : transaction.paymentMethod;
      transaction.description = description !== undefined ? description.trim() : transaction.description;

      const updated = await transaction.save();
      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        isMongo: true,
        data: updated,
      });
    }

    // Local DB update
    const db = loadLocalDb();
    const index = db.transactions.findIndex((tx) => String(tx._id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    db.transactions[index] = {
      ...db.transactions[index],
      title: title !== undefined ? title.trim() : db.transactions[index].title,
      amount: amount !== undefined ? Number(amount) : db.transactions[index].amount,
      type: type !== undefined ? type : db.transactions[index].type,
      category: category !== undefined ? category.trim() : db.transactions[index].category,
      date: date !== undefined ? new Date(date).toISOString() : db.transactions[index].date,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : db.transactions[index].paymentMethod,
      description: description !== undefined ? description.trim() : db.transactions[index].description,
      updatedAt: new Date().toISOString(),
    };

    saveLocalDb(db);

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      isMongo: false,
      data: db.transactions[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
export const deleteTransaction = async (req, res, next) => {
  try {
    if (isMongoActive()) {
      const transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      await transaction.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
        isMongo: true,
        data: { id: req.params.id },
      });
    }

    const db = loadLocalDb();
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter((tx) => String(tx._id) !== String(req.params.id));

    if (db.transactions.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    saveLocalDb(db);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      isMongo: false,
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample transactions and budgets
// @route   POST /api/transactions/seed
export const seedSampleData = async (req, res, next) => {
  try {
    const { sampleTransactions, sampleBudgets } = await import('../scripts/seed.js');

    if (isMongoActive()) {
      const Budget = (await import('../models/Budget.js')).default;
      await Transaction.deleteMany({});
      await Budget.deleteMany({});
      await Transaction.insertMany(sampleTransactions);
      await Budget.insertMany(sampleBudgets);
    }

    // Always seed local DB as well
    const db = loadLocalDb();
    db.transactions = sampleTransactions.map((tx, idx) => ({
      ...tx,
      _id: 'tx_seed_' + (idx + 1),
      date: new Date(tx.date).toISOString(),
    }));
    db.budgets = sampleBudgets.map((b, idx) => ({
      ...b,
      _id: 'bg_seed_' + (idx + 1),
    }));
    saveLocalDb(db);

    res.status(200).json({
      success: true,
      message: `Successfully loaded ${sampleTransactions.length} sample transactions and ${sampleBudgets.length} budgets!`,
      isMongo: isMongoActive(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all transactions and budgets
// @route   DELETE /api/transactions/seed/clear
export const clearAllData = async (req, res, next) => {
  try {
    if (isMongoActive()) {
      const Budget = (await import('../models/Budget.js')).default;
      await Transaction.deleteMany({});
      await Budget.deleteMany({});
    }

    const db = loadLocalDb();
    db.transactions = [];
    db.budgets = [];
    saveLocalDb(db);

    res.status(200).json({
      success: true,
      message: 'All transactions and budgets have been cleared successfully.',
      isMongo: isMongoActive(),
    });
  } catch (error) {
    next(error);
  }
};
