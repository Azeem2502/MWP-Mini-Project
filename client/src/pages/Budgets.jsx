import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  PiggyBank,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { fetchBudgets, saveBudget, deleteBudget } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const Budgets = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('Total');
  const [modalLimit, setModalLimit] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchBudgets({ month: selectedMonth, year: selectedYear });
      if (res.success) {
        setBudgetData(res.data);
      } else {
        setError(res.message || 'Failed to load budgets');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Database error while loading budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenAddModal = (category = 'Total', currentLimit = '') => {
    setModalCategory(category);
    setModalLimit(currentLimit ? String(currentLimit) : '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setModalError('');

    if (modalLimit === '' || Number(modalLimit) < 0) {
      setModalError('Please enter a budget amount greater than or equal to 0.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await saveBudget({
        category: modalCategory,
        monthlyLimit: Number(modalLimit),
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.success) {
        setIsModalOpen(false);
        loadBudgets();
      } else {
        setModalError(res.message || 'Failed to save budget.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving budget to MongoDB.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to remove this budget target?')) return;

    try {
      const res = await deleteBudget(id);
      if (res.success) {
        loadBudgets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting budget.');
    }
  };

  const { overall, budgets = [] } = budgetData || {};
  const monthName = months.find((m) => m.num === Number(selectedMonth))?.name;

  return (
    <div className="budgets-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h2 className="section-title">Monthly Budgets & Limits</h2>
          <p className="section-subtitle">
            Set spending limits, track category usage, and monitor 80% / 100% budget alerts
          </p>
        </div>

        <div className="flex-center gap-2">
          {/* Month & Year Selectors */}
          <div className="month-year-select-wrap">
            <Calendar size={16} className="text-muted" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="month-select"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => handleOpenAddModal('Total')} className="btn-primary flex-center gap-2">
            <PlusCircle size={18} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message={`Calculating ${monthName} ${selectedYear} budget usage from actual transactions...`} />
      ) : error ? (
        <div className="alert-error-box mt-3">
          <p>{error}</p>
          <button onClick={loadBudgets} className="btn-primary mt-2">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Overall Monthly Budget Hero Card */}
          <div className="overall-budget-card">
            <div className="budget-hero-header">
              <div>
                <span className="badge-light">Target Period: {monthName} {selectedYear}</span>
                <h3 className="hero-budget-title">Total Monthly Spending Budget</h3>
              </div>
              <div className="hero-status-pill">
                {overall?.status === 'exceeded' ? (
                  <span className="pill-alert-exceeded flex-center gap-1">
                    <AlertCircle size={15} />
                    <span>Budget Exceeded (&gt;100%)</span>
                  </span>
                ) : overall?.status === 'warning' ? (
                  <span className="pill-alert-warning flex-center gap-1">
                    <AlertTriangle size={15} />
                    <span>Caution: Reached 80%</span>
                  </span>
                ) : (
                  <span className="pill-alert-ok flex-center gap-1">
                    <CheckCircle2 size={15} />
                    <span>Within Budget Safe Zone</span>
                  </span>
                )}
              </div>
            </div>

            <div className="hero-budget-metrics">
              <div className="metric-col">
                <span className="metric-lbl">Total Budget Limit</span>
                <span className="metric-val">{formatCurrency(overall?.limit)}</span>
              </div>
              <div className="metric-col">
                <span className="metric-lbl">Actual Expenses Spent</span>
                <span className="metric-val text-red">{formatCurrency(overall?.spent)}</span>
              </div>
              <div className="metric-col">
                <span className="metric-lbl">Remaining Allowance</span>
                <span className={`metric-val ${overall?.remaining >= 0 ? 'text-green' : 'text-red'}`}>
                  {formatCurrency(overall?.remaining)}
                </span>
              </div>
              <div className="metric-col">
                <span className="metric-lbl">Budget Utilized</span>
                <span className="metric-val font-bold">{overall?.percentUsed}%</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="budget-bar-track mt-3">
              <div
                className={`budget-bar-fill ${
                  overall?.percentUsed > 100
                    ? 'bar-fill-exceeded'
                    : overall?.percentUsed >= 80
                    ? 'bar-fill-warning'
                    : 'bar-fill-normal'
                }`}
                style={{ width: `${Math.min(overall?.percentUsed || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Category Budgets Grid */}
          <div className="section-divider-flex mt-4 mb-3">
            <h3 className="sub-heading">Category-wise Expense Budgets</h3>
            <button
              onClick={() => handleOpenAddModal(EXPENSE_CATEGORIES[0])}
              className="btn-secondary-sm flex-center gap-1"
            >
              <PlusCircle size={15} />
              <span>Add Category Budget</span>
            </button>
          </div>

          {budgets.length === 0 ? (
            <EmptyState
              title={`No Category Budgets Set for ${monthName} ${selectedYear}`}
              message="Create budgets for specific categories like Food, Rent, or Transportation to track your spending limits."
              actionLabel="Add Category Budget"
              onAction={() => handleOpenAddModal(EXPENSE_CATEGORIES[0])}
            />
          ) : (
            <div className="category-budgets-grid">
              {budgets.map((b) => (
                <div key={b._id} className={`cat-budget-card border-${b.status}`}>
                  <div className="cat-budget-header">
                    <div>
                      <h4 className="cat-budget-title">{b.category}</h4>
                      <span className="cat-budget-sub">
                        Limit: {formatCurrency(b.monthlyLimit)}
                      </span>
                    </div>
                    <div className="flex-center gap-1">
                      <button
                        onClick={() => handleOpenAddModal(b.category, b.monthlyLimit)}
                        className="btn-icon-subtle"
                        title="Edit budget limit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="btn-icon-subtle text-red"
                        title="Delete budget"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Warning Badges */}
                  <div className="status-badge-row">
                    {b.status === 'exceeded' ? (
                      <div className="cat-alert-box alert-box-red flex-center gap-1">
                        <AlertCircle size={14} />
                        <span>Exceeded by {formatCurrency(Math.abs(b.remaining))} ({b.percentUsed}%)</span>
                      </div>
                    ) : b.status === 'warning' ? (
                      <div className="cat-alert-box alert-box-yellow flex-center gap-1">
                        <AlertTriangle size={14} />
                        <span>Warning: {b.percentUsed}% of budget reached</span>
                      </div>
                    ) : (
                      <div className="cat-alert-box alert-box-green flex-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>On Track ({b.percentUsed}% used)</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="budget-bar-track mt-2">
                    <div
                      className={`budget-bar-fill ${
                        b.status === 'exceeded'
                          ? 'bar-fill-exceeded'
                          : b.status === 'warning'
                          ? 'bar-fill-warning'
                          : 'bar-fill-normal'
                      }`}
                      style={{ width: `${Math.min(b.percentUsed || 0, 100)}%` }}
                    />
                  </div>

                  {/* Spent vs Remaining numbers */}
                  <div className="cat-budget-footer mt-2">
                    <span className="text-sm text-slate-600">
                      Spent: <strong className="text-red">{formatCurrency(b.spent)}</strong>
                    </span>
                    <span className="text-sm text-slate-600">
                      Remaining: <strong className={b.remaining >= 0 ? 'text-green' : 'text-red'}>
                        {formatCurrency(b.remaining)}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Set / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Set Budget for ${monthName} ${selectedYear}`}
      >
        {modalError && (
          <div className="alert-box alert-error mb-3">
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBudget} className="custom-form">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={modalCategory}
              onChange={(e) => setModalCategory(e.target.value)}
            >
              <option value="Total">Total Overall Monthly Budget</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              className="form-input"
              min="0"
              step="any"
              value={modalLimit}
              onChange={(e) => setModalLimit(e.target.value)}
              required
            />
          </div>

          <p className="text-muted text-xs">
            Spending will be calculated automatically from all Expense transactions recorded in{' '}
            {monthName} {selectedYear}. Alerts will trigger at 80% and 100% threshold.
          </p>

          <div className="modal-actions-right mt-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving Budget...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;
