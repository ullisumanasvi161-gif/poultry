import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  const { message, type, hide } = toast;

  useEffect(() => {
    if (type) {
      const timer = setTimeout(() => {
        hide();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [type, message, hide]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const borders = {
    success: 'border-l-4 border-l-emerald-500',
    error: 'border-l-4 border-l-rose-500',
    warning: 'border-l-4 border-l-amber-500',
    info: 'border-l-4 border-l-blue-500',
  };

  return (
    <AnimatePresence>
      {type && (
        <div className="fixed top-5 right-5 z-[9999] w-full max-w-sm px-4 sm:px-0 no-print">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl ${borders[type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-850 dark:text-white capitalize">
                {type}
              </p>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                {message}
              </p>
            </div>
            <button
              onClick={hide}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-250 cursor-pointer p-0.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
