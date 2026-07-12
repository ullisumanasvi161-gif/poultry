import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, User, LogOut, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  setMobileOpen: (o: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setMobileOpen }) => {
  const { settings, updateSettings, inventory, customers, logout } = useApp();
  const location = useLocation();
  
  const [showProfile, setShowProfile] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Compute dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return [{ name: 'Dashboard', path: '/' }];
    
    return [
      { name: 'Dashboard', path: '/' },
      ...pathnames.map((name, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const displayName = name
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return { name: displayName, path };
      }),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleThemeToggle = () => {
    updateSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light',
    });
  };

  return (
    <header className="sticky top-0 z-35 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 shadow-xs no-print">
      
      {/* Breadcrumbs / Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 md:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>
        
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {breadcrumbs.map((bc, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={12} className="text-slate-400" />}
                {isLast ? (
                  <span className="text-slate-900 dark:text-white font-bold">{bc.name}</span>
                ) : (
                  <Link to={bc.path} className="hover:text-emerald-600 transition-colors">
                    {bc.name}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>



      {/* User Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors"
        >
          {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
              HR
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-white leading-none">Harsha Reddy</span>
              <span className="text-xxs text-slate-400 mt-0.5">Administrator</span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-slate-850">
                <p className="text-xs font-bold text-slate-850 dark:text-white">Harsha Reddy</p>
                <p className="text-xxs text-slate-400 mt-0.5">{settings.companyName}</p>
              </div>
              <div className="p-2 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition"
                >
                  <User size={14} /> My Profile & Settings
                </Link>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer text-left"
                >
                  <LogOut size={14} /> Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
