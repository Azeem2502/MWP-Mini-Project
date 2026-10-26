import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Budget category is required'],
      trim: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Monthly budget limit is required'],
      min: [0, 'Budget limit must be zero or positive'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a category cannot have duplicate budgets in the same month and year
budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
