import React, { useState, useEffect } from 'react';
import { Menu, IndianRupee, Bell, RefreshCw } from 'lucide-react';
import { fetchDashboardSummary } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Navbar = ({ onToggleSidebar }) => {
  const [balance, setBalance] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBalance = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetchDashboardSummary();
      if (res?.success) {
        setBalance(res.data.summary.currentBalance);
      }
    } catch (err) {
      // Non-blocking in navbar
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBalance();
    // Listen for custom transaction update events to refresh balance pill
    const handleUpdate = () => loadBalance();
    window.addEventListener('expense-tracker-updated', handleUpdate);
    return () => window.removeEventListener('expense-tracker-updated', handleUpdate);
  }, []);

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="mobile-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="page-title-wrap">
          <h1 className="nav-page-title">Personal Expense Tracker</h1>
          <span className="nav-page-sub">College Mini Project Dashboard</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Currency badge */}
        <div className="currency-badge" title="Default Currency: Indian Rupee (INR)">
          <IndianRupee size={14} className="rupee-icon" />
          <span>INR (₹)</span>
        </div>

        {/* Live Balance Pill */}
        {balance !== null && (
          <div
            className={`balance-pill ${balance >= 0 ? 'pill-positive' : 'pill-negative'}`}
            title="Real-time balance calculated from database"
          >
            <span className="pill-label">Balance:</span>
            <span className="pill-val">{formatCurrency(balance)}</span>
          </div>
        )}

        <button
          className={`refresh-btn ${isRefreshing ? 'refresh-spin' : ''}`}
          onClick={loadBalance}
          title="Refresh dashboard metrics"
        >
          <RefreshCw size={17} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
