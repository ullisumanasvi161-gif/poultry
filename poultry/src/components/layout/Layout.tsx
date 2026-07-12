import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Toast } from '../ui/Toast';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Toast Overlays */}
      <Toast />

      {/* Left Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Right Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar setMobileOpen={setMobileSidebarOpen} />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* Main page router output */}
          <Outlet />
        </main>
        
        <footer className="py-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xxs text-slate-400 no-print bg-white dark:bg-slate-900/20">
          Reddy Chicken and Mutton Poultry ERP © 2026. Made with Google Deepmind Partner Assistant.
        </footer>
      </div>
    </div>
  );
};
