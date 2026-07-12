import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center z-40 transition-all duration-300">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-10 w-10 text-[#2E7D32]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide animate-pulse">
          Verifying credentials...
        </span>
      </div>
    </div>
  );
};
