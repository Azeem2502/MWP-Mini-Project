import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="main-viewport">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="page-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
