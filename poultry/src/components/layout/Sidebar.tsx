import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Receipt, 
  FileSpreadsheet, 
  TrendingUp, 
  Warehouse, 
  DollarSign, 
  Calculator, 
  BookOpen, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Purchases', path: '/purchases', icon: <Receipt size={20} /> },
    { name: 'Sales Billing', path: '/sales', icon: <FileSpreadsheet size={20} /> },
    { name: 'Supplier Management', path: '/suppliers', icon: <Truck size={20} /> },
    { name: 'Customer Management', path: '/customers', icon: <Users size={20} /> },
    { name: 'Market Rates', path: '/market-rates', icon: <TrendingUp size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Warehouse size={20} /> },
    { name: 'Payments', path: '/payments', icon: <DollarSign size={20} /> },
    { name: 'Expense Manager', path: '/expenses', icon: <Calculator size={20} /> },
    { name: 'Ledger Vouchers', path: '/ledgers', icon: <BookOpen size={20} /> },
    { name: 'Reports Panel', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 select-none border-r border-slate-200 dark:border-slate-800/80">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl flex items-center justify-center font-bold">
          <Flame size={22} className="animate-bounce" />
        </div>
        {(!isCollapsed || mobileOpen) && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase leading-tight">Reddy Chicken and Mutton Poultry</span>
            <span className="text-xxs text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase">Wholesale ERP</span>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold border-l-4 border-l-emerald-500 rounded-l-none'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-850/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200 text-current">
              {item.icon}
            </div>
            {(!isCollapsed || mobileOpen) && (
              <span className="truncate transition-opacity duration-200">{item.name}</span>
            )}
            
            {/* Hover Tooltip when collapsed */}
            {isCollapsed && !mobileOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap shadow-xl">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle Footer Button (Desktop only) */}
      <div className="hidden md:flex p-4 border-t border-slate-100 dark:border-slate-800 justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition duration-200 cursor-pointer focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Drawer Container */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sticky Sidebar */}
      <div
        className={`hidden md:block h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
