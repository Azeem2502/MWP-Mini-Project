import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PlusCircle,
  ArrowRight,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { fetchDashboardSummary } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchDashboardSummary();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to connect to backend server. Make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard financial analytics..." />;
  }

  if (error) {
    return (
      <div className="alert-error-box">
        <h3>Backend Connection Error</h3>
        <p>{error}</p>
        <button onClick={loadDashboard} className="btn-primary mt-3">
          Retry
        </button>
      </div>
    );
  }

  const { summary, charts, recentTransactions } = data || {};
  const hasTransactions = summary?.totalIncome > 0 || summary?.totalExpenses > 0;

  return (
    <div className="dashboard-page">
      {/* Page Title & Action Bar */}
      <div className="page-header-flex">
        <div>
          <div className="flex-center gap-2">
            <h2 className="section-title">Financial Overview</h2>
            <span className="badge badge-income" title="Running directly in browser with persistent local storage">
              ⚡ Direct Mode (GitHub Ready)
            </span>
          </div>
          <p className="section-subtitle">
            Real-time financial analytics powered directly in your browser with persistent storage.
          </p>
        </div>
        <Link to="/add" className="btn-primary flex-center gap-2">
          <PlusCircle size={18} />
          <span>Add Transaction</span>
        </Link>
      </div>

      {/* 4 Summary Cards */}
      <div className="cards-grid">
        <SummaryCard
          title="Total Income"
          amount={formatCurrency(summary?.totalIncome)}
          subtitle="All-time credited income"
          icon={TrendingUp}
          variant="green"
        />

        <SummaryCard
          title="Total Expenses"
          amount={formatCurrency(summary?.totalExpenses)}
          subtitle="All-time debited expenses"
          icon={TrendingDown}
          variant="red"
        />

        <SummaryCard
          title="Current Balance"
          amount={formatCurrency(summary?.currentBalance)}
          subtitle="Total Income - Total Expenses"
          icon={Wallet}
          variant={summary?.currentBalance >= 0 ? 'blue' : 'red'}
        />

        <SummaryCard
          title="Monthly Savings"
          amount={formatCurrency(summary?.monthlySavings)}
          subtitle="Current month net savings"
          icon={PiggyBank}
          variant={summary?.monthlySavings >= 0 ? 'emerald' : 'amber'}
        />
      </div>

      {!hasTransactions ? (
        <EmptyState
          title="No Transactions Found in Database"
          message="Start tracking your finances by adding your first income or expense transaction, or load sample data from Settings."
          actionLabel="Add First Transaction"
          actionLink="/add"
        />
      ) : (
        <>
          {/* Charts Row */}
          <div className="charts-grid">
            {/* 1. Category Expense Pie Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="flex-center gap-2">
                  <PieIcon size={18} className="text-blue" />
                  <h3 className="chart-title">Expenses by Category</h3>
                </div>
                <span className="badge-light">All-time</span>
              </div>
              <div className="chart-body">
                {charts?.categoryExpenses?.length === 0 ? (
                  <p className="text-muted text-center py-5">No expense data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={charts.categoryExpenses}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {charts.categoryExpenses.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val) => [formatCurrency(val), 'Amount']}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 2. Monthly Comparison Bar Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="flex-center gap-2">
                  <BarIcon size={18} className="text-blue" />
                  <h3 className="chart-title">Income vs Expenses (Last 6 Months)</h3>
                </div>
                <span className="badge-light">Comparison</span>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={charts?.monthlyComparison || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v}`} />
                    <RechartsTooltip
                      formatter={(val) => [formatCurrency(val), '']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Daily Spending Trends Line Chart */}
          <div className="chart-card mt-4">
            <div className="chart-card-header">
              <div className="flex-center gap-2">
                <LineIcon size={18} className="text-blue" />
                <h3 className="chart-title">Current Month Daily Spending Trend</h3>
              </div>
              <span className="badge-light">Daily Activity</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={charts?.spendingTrends || []} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v}`} />
                  <RechartsTooltip formatter={(val) => [formatCurrency(val), 'Daily Expense']} />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Daily Expense"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284c7' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent 5 Transactions */}
          <div className="content-card mt-4">
            <div className="card-header-flex">
              <div>
                <h3 className="card-heading">Recent Transactions</h3>
                <p className="card-subheading">Latest 5 financial records</p>
              </div>
              <Link to="/transactions" className="link-see-all flex-center gap-1">
                <span>View All History</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions?.map((tx) => (
                    <tr key={tx._id}>
                      <td className="font-semibold text-slate-800">{tx.title}</td>
                      <td>
                        <span className={`badge ${tx.type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>{tx.category}</td>
                      <td className="text-muted">{formatDate(tx.date)}</td>
                      <td>
                        <span className="method-tag">{tx.paymentMethod}</span>
                      </td>
                      <td className={`text-right font-bold ${tx.type === 'Income' ? 'text-green' : 'text-red'}`}>
                        {tx.type === 'Income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
