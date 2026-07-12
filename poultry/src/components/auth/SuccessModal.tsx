import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="w-full max-w-sm relative z-10 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 overflow-hidden items-center"
          >
            {/* Green Success Icon Checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 w-20 h-20 mb-6 text-emerald-600"
            >
              <CheckCircle size={44} className="stroke-[2.5]" />
            </motion.div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white text-center">
              Login Successful
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2.5 mb-2 px-4 leading-relaxed">
              Welcome back to Reddy Chicken and Mutton Poultry ERP.
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-450 text-center font-bold mt-2 animate-pulse flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-450 animate-ping"></span>
              Redirecting you to dashboard...
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
