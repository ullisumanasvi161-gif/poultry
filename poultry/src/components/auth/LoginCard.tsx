import React from 'react';

interface LoginCardProps {
  children: React.ReactNode;
}

export const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
  return (
    <div className="w-full max-w-[450px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[20px] shadow-2xl border border-white/20 dark:border-slate-800/80 p-8 flex flex-col relative overflow-hidden transition-all duration-350">
      {/* Reddy Chicken and Mutton Poultry Brand Logo */}
      <div className="flex flex-col items-center mb-6 select-none">
        <div className="bg-pink-100 dark:bg-pink-900/30 p-3.5 rounded-2xl text-pink-500 dark:text-pink-300 flex items-center justify-center mb-3.5 shadow-sm">
          <svg className="w-9 h-9 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {/* Egg / Bird abstract outline */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-9 4-9 11a9 9 0 0018 0c0-7-7.8-11-9-11z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9c-1 0-3 1.5-3 4.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center max-w-[300px]">
          Login to continue managing your poultry business.
        </p>
      </div>

      {children}
    </div>
  );
};
