import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowUpDown,
  Calendar,
  X,
  AlertTriangle,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  fetchTransactions,
  updateTransaction,
  deleteTransaction,
} from '../services/api';
import { formatCurrency, formatDate, formatDateForInput, exportTransactionsToCSV } from '../utils/formatters';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit Modal State
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    type: 'Expense',
    category: '',
    date: '',
    paymentMethod: 'Cash',
    description: '',
  });
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: searchTerm,
        type: typeFilter,
        category: categoryFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      };

      const res = await fetchTransactions(params);
      if (res.success) {
        setTransactions(res.data);
      } else {
        setError(res.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(delayTimer);
  }, [searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Open Edit Modal
  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setEditForm({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: formatDateForInput(tx.date),
      paymentMethod: tx.paymentMethod || 'Cash',
      description: tx.description || '',
    });
    setEditError('');
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.title.trim()) {
      setEditError('Title is required');
      return;
    }
    if (!editForm.amount || Number(editForm.amount) <= 0) {
      setEditError('Amount must be greater than zero');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await updateTransaction(editingTransaction._id, {
        ...editForm,
        amount: Number(editForm.amount),
      });

      if (res.success) {
        setEditingTransaction(null);
        loadData();
        window.dispatchEvent(new Event('expense-tracker-updated'));
      } else {
        setEditError(res.message || 'Failed to update transaction');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm and Delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const res = await deleteTransaction(deletingId);
      if (res.success) {
        setDeletingId(null);
        loadData();
        window.dispatchEvent(new Event('expense-tracker-updated'));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  // List of all categories for dropdown
  const allCategories = ['All', ...Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]))];

  return (
    <div className="transactions-page">
      {/* Page Header */}
      <div className="page-header-flex">
        <div>
          <h2 className="section-title">Transaction History</h2>
          <p className="section-subtitle">
            Manage, filter, search, edit, and export your personal finance records
          </p>
        </div>
        <div className="flex-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              className="btn-secondary flex-center gap-2"
              title="Download CSV file of displayed transactions"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          )}
          <Link to="/add" className="btn-primary flex-center gap-2">
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="filter-card">
        <div className="filter-grid">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title (e.g. Salary, Groceries)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCategoryFilter('All');
              }}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="Income">Income (+)</option>
              <option value="Expense">Expense (-)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Field & Order */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f);
                setSortOrder(o);
              }}
              className="filter-select"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Date Range Sub-row */}
        <div className="date-filter-row">
          <div className="flex-center gap-2">
            <Calendar size={16} className="text-muted" />
            <span className="text-sm font-medium text-slate-700">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input-small"
              title="Start date"
            />
            <span className="text-muted text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input-small"
              title="End date"
            />
          </div>

          <button onClick={handleResetFilters} className="btn-text-reset flex-center gap-1">
            <RotateCcw size={14} />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* Main Transactions Table or Loading/Empty state */}
      {loading ? (
        <LoadingSpinner message="Loading transaction records from database..." />
      ) : error ? (
        <div className="alert-error-box mt-3">
          <p>{error}</p>
          <button onClick={loadData} className="btn-primary mt-2">
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No Transactions Match Your Filter"
          message={
            searchTerm || typeFilter !== 'All' || categoryFilter !== 'All' || startDate || endDate
              ? 'Try adjusting or resetting your search and filter parameters.'
              : 'No transactions have been recorded in the database yet.'
          }
          actionLabel={
            searchTerm || typeFilter !== 'All' || categoryFilter !== 'All' || startDate || endDate
              ? 'Clear All Filters'
              : 'Add Transaction'
          }
          onAction={
            searchTerm || typeFilter !== 'All' || categoryFilter !== 'All' || startDate || endDate
              ? handleResetFilters
              : undefined
          }
          actionLink={
            !(searchTerm || typeFilter !== 'All' || categoryFilter !== 'All' || startDate || endDate)
              ? '/add'
              : undefined
          }
        />
      ) : (
        <div className="content-card mt-3">
          <div className="table-header-info">
            <span>
              Showing <strong>{transactions.length}</strong> transactions
            </span>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div className="title-cell-wrap">
                        <span className="font-semibold text-slate-800">{tx.title}</span>
                        {tx.description && <span className="cell-subtext">{tx.description}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <span className="category-pill">{tx.category}</span>
                    </td>
                    <td className={`text-right font-bold ${tx.type === 'Income' ? 'text-green' : 'text-red'}`}>
                      {tx.type === 'Income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                    <td className="text-muted text-sm">{formatDate(tx.date)}</td>
                    <td>
                      <span className="method-tag">{tx.paymentMethod}</span>
                    </td>
                    <td>
                      <div className="action-buttons-flex">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="action-icon-btn edit-btn"
                          title="Edit transaction"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx._id)}
                          className="action-icon-btn delete-btn"
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
      >
        {editError && (
          <div className="alert-box alert-error mb-3">
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEdit} className="custom-form">
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn ${editForm.type === 'Expense' ? 'active-expense' : ''}`}
                onClick={() =>
                  setEditForm((prev) => ({
                    ...prev,
                    type: 'Expense',
                    category: EXPENSE_CATEGORIES[0],
                  }))
                }
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${editForm.type === 'Income' ? 'active-income' : ''}`}
                onClick={() =>
                  setEditForm((prev) => ({
                    ...prev,
                    type: 'Income',
                    category: INCOME_CATEGORIES[0],
                  }))
                }
              >
                Income
              </button>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                min="0.01"
                step="any"
                className="form-input"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                {(editForm.type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows="2"
              className="form-textarea"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div className="modal-actions-right">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditingTransaction(null)}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Confirm Delete"
      >
        <div className="delete-confirm-box">
          <div className="delete-icon-wrapper">
            <AlertTriangle size={32} className="text-red" />
          </div>
          <p className="delete-confirm-text">
            Are you sure you want to delete this transaction record from MongoDB? This action
            cannot be undone and will immediately recalculate your dashboard totals.
          </p>
          <div className="modal-actions-right mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
