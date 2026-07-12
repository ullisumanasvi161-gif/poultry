import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  isLoading: boolean;
  text: string;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ isLoading, text, className = '', disabled }) => {
  const isBtnDisabled = isLoading || disabled;

  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -0.5 }}
      whileTap={{ scale: 0.985 }}
      type="submit"
      disabled={isBtnDisabled}
      className={`w-full py-3 bg-pink-300 hover:bg-pink-400 active:scale-95 text-black font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-pink-300/30 ${
        isBtnDisabled ? 'opacity-80 pointer-events-none' : ''
      } ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4.5 w-4.5 text-black" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Authenticating...</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </motion.button>
  );
};
