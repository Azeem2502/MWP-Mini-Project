import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  PiggyBank,
  BarChart3,
  Settings,
  Wallet,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Transaction', path: '/add', icon: PlusCircle },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-brand">
            <div className="logo-icon-box">
              <Wallet size={22} className="logo-icon" />
            </div>
            <div>
              <h2 className="brand-title">ExpenseTracker</h2>
              <span className="brand-badge">MERN Stack</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-group-title">MAIN MENU</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link-item ${isActive ? 'nav-link-active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={19} className="nav-icon" />
                <span className="nav-text">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-pill">
            <span className="status-dot"></span>
            <span className="status-label">Direct Storage Active</span>
          </div>
          <p className="footer-credits">College Mini Project © 2026</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
