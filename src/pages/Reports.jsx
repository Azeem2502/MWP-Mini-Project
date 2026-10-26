import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Award,
  CreditCard,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchReportsAnalytics, fetchTransactions } from '../services/api';
import { formatCurrency, exportTransactionsToCSV } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import SummaryCard from '../components/SummaryCard';
import EmptyState from '../components/EmptyState';

const Reports = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState('All');

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const months = [
    { value: 'All', label: 'All Months (Full Year)' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [
    String(currentDate.getFullYear() - 1),
    String(currentDate.getFullYear()),
    String(currentDate.getFullYear() + 1),
  ];

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        year: selectedYear,
        month: selectedMonth,
      };

      const res = await fetchReportsAnalytics(params);
      if (res.success) {
        setAnalytics(res.data);
      } else {
        setError(res.message || 'Failed to generate financial reports');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Database error generating reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      // Fetch all transactions for this report period
      const params = {
        sortBy: 'date',
        sortOrder: 'desc',
      };
      if (selectedYear !== 'All') {
        if (selectedMonth !== 'All') {
          const m = Number(selectedMonth);
          params.startDate = new Date(Number(selectedYear), m - 1, 1).toISOString();
          params.endDate = new Date(Number(selectedYear), m, 0, 23, 59, 59).toISOString();
        } else {
          params.startDate = new Date(Number(selectedYear), 0, 1).toISOString();
          params.endDate = new Date(Number(selectedYear), 11, 31, 23, 59, 59).toISOString();
        }
      }

      const res = await fetchTransactions(params);
      if (res.success && res.data.length > 0) {
        const periodName = selectedMonth !== 'All' ? `month-${selectedMonth}-${selectedYear}` : `year-${selectedYear}`;
        exportTransactionsToCSV(res.data, `expense-report-${periodName}.csv`);
      } else {
        alert('No transactions found for the selected period to export.');
      }
    } catch (err) {
      alert('Failed to export CSV report: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating MongoDB reports & financial analytics..." />;
  }

  if (error) {
    return (
      <div className="alert-error-box">
        <p>{error}</p>
        <button onClick={loadAnalytics} className="btn-primary mt-2">
          Retry
        </button>
      </div>
    );
  }

  const {
    totalIncome = 0,
    totalExpenses = 0,
    netSavings = 0,
    highestSpendingCategory,
    categoryBreakdown = [],
    monthlyTrends = [],
    paymentMethods = [],
    transactionCount = 0,
  } = analytics || {};

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h2 className="section-title">Reports & Financial Analytics</h2>
          <p className="section-subtitle">
            Comprehensive period-wise breakdown, trends comparison, and CSV data export
          </p>
        </div>

        <div className="flex-center gap-2">
          {/* Filter selectors */}
          <div className="month-year-select-wrap">
            <Calendar size={16} className="text-muted" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-select"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="year-select"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-primary flex-center gap-2"
            disabled={isExporting || transactionCount === 0}
            title="Download CSV report for selected period"
          >
            <Download size={16} />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {transactionCount === 0 ? (
        <EmptyState
          title="No Financial Activity in Selected Period"
          message={`No transactions were recorded for ${selectedMonth !== 'All' ? `Month ${selectedMonth}, ` : ''}${selectedYear}. Try selecting a different period or adding transactions.`}
          actionLabel="Go to Transactions"
          actionLink="/transactions"
        />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="cards-grid">
            <SummaryCard
              title="Period Income"
              amount={formatCurrency(totalIncome)}
              subtitle={`Total earned in ${selectedYear}`}
              icon={TrendingUp}
              variant="green"
            />

            <SummaryCard
              title="Period Expenses"
              amount={formatCurrency(totalExpenses)}
              subtitle={`Total spent in ${selectedYear}`}
              icon={TrendingDown}
              variant="red"
            />

            <SummaryCard
              title="Net Savings"
              amount={formatCurrency(netSavings)}
              subtitle="Income - Expenses"
              icon={PiggyBank}
              variant={netSavings >= 0 ? 'emerald' : 'amber'}
            />

            <SummaryCard
              title="Top Expense Category"
              amount={highestSpendingCategory ? highestSpendingCategory.category : 'N/A'}
              subtitle={
                highestSpendingCategory
                  ? `${formatCurrency(highestSpendingCategory.amount)} (${highestSpendingCategory.percentage}%)`
                  : 'No expenses'
              }
              icon={Award}
              variant="blue"
            />
          </div>

          {/* Charts Row */}
          <div className="charts-grid mt-4">
            {/* Monthly Trend Comparison */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="flex-center gap-2">
                  <BarChart3 size={18} className="text-blue" />
                  <h3 className="chart-title">Income vs Expenses Monthly Trend</h3>
                </div>
                <span className="badge-light">{selectedYear}</span>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v}`} />
                    <RechartsTooltip formatter={(val) => [formatCurrency(val), '']} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="flex-center gap-2">
                  <PieIcon size={18} className="text-blue" />
                  <h3 className="chart-title">Category-wise Expense Breakdown</h3>
                </div>
                <span className="badge-light">Share (%)</span>
              </div>
              <div className="chart-body">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-muted text-center py-5">No expense data to display</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val) => [formatCurrency(val), 'Expenses']}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Category Table Breakdown & Payment Method Distribution */}
          <div className="charts-grid mt-4">
            {/* Category Breakdown List */}
            <div className="content-card">
              <h3 className="card-heading mb-3">Category Spending Breakdown</h3>
              <div className="category-report-list">
                {categoryBreakdown.map((item, idx) => (
                  <div key={item.category} className="cat-report-row">
                    <div className="cat-report-info">
                      <span className="cat-report-name">
                        <span
                          className="legend-color-dot"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        {item.category}
                      </span>
                      <span className="cat-report-amt font-semibold text-slate-800">
                        {formatCurrency(item.amount)}{' '}
                        <span className="text-muted font-normal text-xs">({item.percentage}%)</span>
                      </span>
                    </div>
                    <div className="budget-bar-track mt-1">
                      <div
                        className="budget-bar-fill bar-fill-normal"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="content-card">
              <h3 className="card-heading mb-3 flex-center gap-2">
                <CreditCard size={18} className="text-blue" />
                <span>Payment Method Volume</span>
              </h3>
              <div className="payment-method-list">
                {paymentMethods.map((pm) => (
                  <div key={pm.method} className="payment-method-item">
                    <span className="method-tag">{pm.method}</span>
                    <span className="font-bold text-slate-800">{formatCurrency(pm.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
