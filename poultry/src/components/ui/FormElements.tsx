import React, { forwardRef } from 'react';

interface BaseInputProps {
  label?: string;
  error?: any; // Changed from string to any to accept React Hook Form FieldError shapes
  helperText?: string;
}

// Helper to extract message from field error
const getErrorMessage = (error: any): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error.message) return String(error.message);
  return null;
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const errorMsg = getErrorMessage(error);
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100 placeholder-slate-400 ${
            errorMsg ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''
          } ${className}`}
          {...props}
        />
        {errorMsg && (
          <span className="text-xxs font-medium text-rose-500 pl-0.5">{errorMsg}</span>
        )}
        {!errorMsg && helperText && (
          <span className="text-xxs text-slate-400 dark:text-slate-505 pl-0.5">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    const errorMsg = getErrorMessage(error);
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100 appearance-none ${
              errorMsg ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errorMsg && (
          <span className="text-xxs font-medium text-rose-500 pl-0.5">{errorMsg}</span>
        )}
        {!errorMsg && helperText && (
          <span className="text-xxs text-slate-400 pl-0.5">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const errorMsg = getErrorMessage(error);
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={3}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100 placeholder-slate-400 resize-none ${
            errorMsg ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''
          } ${className}`}
          {...props}
        />
        {errorMsg && (
          <span className="text-xxs font-medium text-rose-500 pl-0.5">{errorMsg}</span>
        )}
        {!errorMsg && helperText && (
          <span className="text-xxs text-slate-400 pl-0.5">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
