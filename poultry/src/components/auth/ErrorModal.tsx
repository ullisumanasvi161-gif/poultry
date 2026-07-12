import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, onTryAgain }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="w-full max-w-sm relative z-10 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden"
          >
            {/* Top Red Alert Icon */}
            <div className="flex justify-center mb-5 mt-2">
              <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-900/30 w-16 h-16">
                <AlertCircle size={32} className="text-rose-500" />
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white text-center">
              Login Failed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1.5 mb-6 px-4 leading-relaxed">
              The mobile number or PIN you entered is incorrect.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onTryAgain}
                className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
