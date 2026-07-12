import React, { forwardRef } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: any;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    // Restrict input to digits only
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Phone size={18} />
          </div>
          <input
            ref={ref}
            type="tel"
            maxLength={10}
            onKeyPress={handleKeyPress}
            className={`w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-300 transition-all dark:text-slate-100 placeholder-slate-400 ${
              error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xxs font-medium text-rose-500 pl-0.5">{error.message}</span>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
