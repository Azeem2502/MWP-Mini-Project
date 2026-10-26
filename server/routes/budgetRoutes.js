import express from 'express';
import {
  getBudgets,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';

const router = express.Router();

router.route('/')
  .get(getBudgets)
  .post(createOrUpdateBudget);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

export default router;
