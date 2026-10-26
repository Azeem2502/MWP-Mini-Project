import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  IndianRupee,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Server,
  Info,
} from 'lucide-react';
import { checkServerHealth, seedSampleData, clearAllData } from '../services/api';

const Settings = () => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || 'INR');
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');

  const [dbStatus, setDbStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadHealth = async () => {
    try {
      setCheckingHealth(true);
      const res = await checkServerHealth();
      setDbStatus(res?.database);
    } catch (err) {
      setDbStatus({
        connected: false,
        error: err.response?.data?.message || 'Server not reachable',
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleCurrencyChange = (newVal) => {
    setCurrency(newVal);
    localStorage.setItem('app_currency', newVal);
    setFeedback({
      type: 'success',
      message: `Currency set to ${newVal}. All monetary amounts are formatted in ${newVal} (₹).`,
    });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    setFeedback({
      type: 'success',
      message: 'Theme preference saved.',
    });
  };

  // Load sample data into MongoDB
  const handleLoadSampleData = async () => {
    try {
      setActionLoading(true);
      setFeedback({ type: '', message: '' });
      const res = await seedSampleData();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Sample transactions and budgets loaded successfully into MongoDB!',
        });
        window.dispatchEvent(new Event('expense-tracker-updated'));
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to seed sample data.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Clear all data from MongoDB
  const handleClearAll = async () => {
    if (!window.confirm('WARNING: This will permanently delete ALL transactions and budgets from your MongoDB database. Continue?')) {
      return;
    }

    try {
      setActionLoading(true);
      setFeedback({ type: '', message: '' });
      const res = await clearAllData();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'All transactions and budgets have been erased from database.',
        });
        window.dispatchEvent(new Event('expense-tracker-updated'));
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to clear data.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header-flex">
        <div>
          <h2 className="section-title">Application Settings</h2>
          <p className="section-subtitle">
            Configure system preferences, database connectivity, and sample demonstration data
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div className={`alert-box mb-4 ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Card 1: Application Information */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="flex-center gap-2">
              <Info size={18} className="text-blue" />
              <h3 className="card-heading">Project Overview</h3>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="info-row">
              <span className="info-key">Project Title:</span>
              <span className="info-val font-semibold">React Personal Expense Tracker</span>
            </div>
            <div className="info-row">
              <span className="info-key">Architecture:</span>
              <span className="info-val">MERN Stack (MongoDB, Express, React, Node.js)</span>
            </div>
            <div className="info-row">
              <span className="info-key">Frontend Tooling:</span>
              <span className="info-val">Vite, React 18, React Router, Recharts, Lucide</span>
            </div>
            <div className="info-row">
              <span className="info-key">Backend Tooling:</span>
              <span className="info-val">Express.js REST API with Mongoose ODM</span>
            </div>
            <div className="info-row">
              <span className="info-key">Project Scope:</span>
              <span className="info-val">Single-user College Mini Project / Review Demo</span>
            </div>
          </div>
        </div>

        {/* Card 2: Currency & Regional Preferences */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="flex-center gap-2">
              <IndianRupee size={18} className="text-blue" />
              <h3 className="card-heading">Currency & Theme</h3>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="form-group mb-3">
              <label className="form-label">Default Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
              </select>
              <span className="text-muted text-xs mt-1">
                Indian Rupees (₹) is the standardized default currency throughout all dashboards and reports.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Theme Mode</label>
              <select
                className="form-select"
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                <option value="light">Light Theme (Default / Clean White)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Storage Engine & Deployment Status */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="flex-center gap-2">
              <Database size={18} className="text-blue" />
              <h3 className="card-heading">Storage Engine & GitHub Deployment</h3>
            </div>
            <button
              onClick={loadHealth}
              className={`refresh-btn ${checkingHealth ? 'refresh-spin' : ''}`}
              title="Refresh Storage Status"
            >
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="settings-card-body">
            <div className="db-status-banner mb-3">
              <div className="flex-center gap-2">
                <span className="status-dot dot-connected" />
                <span className="font-semibold text-slate-800">
                  ⚡ Direct Browser Storage Active
                </span>
              </div>
              <span className="text-xs text-muted">
                Zero localhost dependency: 100% GitHub Pages & Vercel ready
              </span>
            </div>

            <div className="info-row">
              <span className="info-key">Storage Engine:</span>
              <span className="info-val font-mono">Browser LocalStorage API</span>
            </div>
            <div className="info-row">
              <span className="info-key">Data Persistence:</span>
              <span className="info-val font-mono">Saved locally across page reloads</span>
            </div>
            <div className="info-row">
              <span className="info-key">Server Dependency:</span>
              <span className="info-val text-xs text-green font-semibold">None (Runs directly)</span>
            </div>

            <div className="setup-guide-box mt-3">
              <h4 className="guide-title flex-center gap-1">
                <HelpCircle size={15} />
                <span>GitHub & Cloud Deployment Guide:</span>
              </h4>
              <p className="text-xs text-slate-600 mb-2">
                This project is structured so you can push it to GitHub and deploy it directly without needing any localhost server running:
              </p>
              <ol className="guide-steps">
                <li>
                  <strong>GitHub:</strong> Initialize git, commit your files, and push to your GitHub repository.
                </li>
                <li>
                  <strong>Vercel / Netlify:</strong> Import the repository directly for automatic 1-click free hosting.
                </li>
                <li>
                  <strong>GitHub Pages:</strong> Build with <code>npm run build</code> and host the <code>dist/</code> folder.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Card 4: Sample Data & Demonstration Controls */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="flex-center gap-2">
              <Sliders size={18} className="text-blue" />
              <h3 className="card-heading">Sample Data Management</h3>
            </div>
          </div>
          <div className="settings-card-body">
            <p className="text-sm text-slate-600 mb-3">
              Load realistic sample income & expenses (Salary ₹25,000, Groceries ₹2,000, Rent ₹4,500, Internet ₹999)
              along with monthly budgets for college review presentation.
            </p>

            <div className="flex-center gap-3">
              <button
                onClick={handleLoadSampleData}
                disabled={actionLoading}
                className="btn-primary flex-center gap-2"
              >
                <Server size={16} />
                <span>{actionLoading ? 'Loading...' : 'Load Sample Data'}</span>
              </button>

              <button
                onClick={handleClearAll}
                disabled={actionLoading}
                className="btn-danger flex-center gap-2"
              >
                <Trash2 size={16} />
                <span>Clear Database</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
