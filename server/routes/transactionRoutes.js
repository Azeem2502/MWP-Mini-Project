import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  seedSampleData,
  clearAllData,
} from '../controllers/transactionController.js';

const router = express.Router();

// Seed and Clear endpoints
router.post('/seed', seedSampleData);
router.delete('/seed/clear', clearAllData);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
