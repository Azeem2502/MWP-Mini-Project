import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { createTransaction } from '../services/api';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import { formatDateForInput } from '../utils/formatters';

const AddTransaction = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(formatDateForInput());
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // When type changes, switch default category
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'Income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validations
    if (!title.trim()) {
      setErrorMessage('Please enter a transaction title.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMessage('Amount must be greater than zero.');
      return;
    }

    if (!date) {
      setErrorMessage('Please select a valid date.');
      return;
    }

    if (!category) {
      setErrorMessage('Please choose a category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        amount: Number(amount),
        type,
        category,
        date,
        paymentMethod,
        description: description.trim(),
      };

      const res = await createTransaction(payload);

      if (res.success) {
        setSuccessMessage('Transaction saved successfully to database!');

        // Dispatch update event so navbar balance updates immediately
        window.dispatchEvent(new Event('expense-tracker-updated'));

        // Reset form
        setTitle('');
        setAmount('');
        setType('Expense');
        setCategory(EXPENSE_CATEGORIES[0]);
        setDate(formatDateForInput());
        setPaymentMethod('Cash');
        setDescription('');

        // Redirect after a brief moment or give user choice
        setTimeout(() => {
          navigate('/transactions');
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Failed to save transaction.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Server error occurred while saving transaction.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="form-page-container">
      <div className="page-header-flex">
        <div>
          <h2 className="section-title">Add New Transaction</h2>
          <p className="section-subtitle">Record an income or expense transaction to MongoDB</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary flex-center gap-1">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="form-card">
        {/* Alerts */}
        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="custom-form">
          {/* Type Selector (Radio Tabs) */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'Expense' ? 'active-expense' : ''}`}
                onClick={() => handleTypeChange('Expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'Income' ? 'active-income' : ''}`}
                onClick={() => handleTypeChange('Income')}
              >
                Income
              </button>
            </div>
          </div>

          <div className="form-row-2">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Transaction Title <span className="text-red">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly Salary, Groceries, Books"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                maxLength={100}
                required
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">
                Amount (₹) <span className="text-red">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                className="form-input"
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                Category <span className="text-red">*</span>
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                required
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">
                Date <span className="text-red">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isSubmitting}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              rows="3"
              placeholder="Add optional notes, invoice numbers, or details..."
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions-flex">
            <button
              type="submit"
              className="btn-primary flex-center gap-2"
              disabled={isSubmitting}
            >
              <PlusCircle size={18} />
              <span>{isSubmitting ? 'Saving Transaction...' : 'Save Transaction'}</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setTitle('');
                setAmount('');
                setDescription('');
                setErrorMessage('');
              }}
              disabled={isSubmitting}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
