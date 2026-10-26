import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['Income', 'Expense'],
        message: 'Type must be either Income or Expense',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'],
        message: 'Invalid payment method',
      },
      default: 'Cash',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance on queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
