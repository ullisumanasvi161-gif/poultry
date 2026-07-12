import React, { useState, useRef, useEffect } from 'react';

interface PinInputProps {
  onChange: (pin: string) => void;
  error?: any;
}

export const PinInput: React.FC<PinInputProps> = ({ onChange, error }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [visibleIndices, setVisibleIndices] = useState<Record<number, boolean>>({});
  
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const timeouts = useRef<Record<number, any>>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout);
    };
  }, []);

  const handleChange = (val: string, index: number) => {
    // Extract only digits, get last character typed
    const lastChar = val.replace(/[^0-9]/g, '').slice(-1);
    
    const newPin = [...pin];
    newPin[index] = lastChar;
    setPin(newPin);
    
    const pinString = newPin.join('');
    onChange(pinString);

    if (lastChar) {
      // Temporarily reveal typed character
      setVisibleIndices(prev => ({ ...prev, [index]: true }));
      
      if (timeouts.current[index]) {
        clearTimeout(timeouts.current[index]);
      }
      
      timeouts.current[index] = setTimeout(() => {
        setVisibleIndices(prev => ({ ...prev, [index]: false }));
      }, 1000);

      // Auto focus next box
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // Clear previous input and focus it
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        onChange(newPin.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (pin[index]) {
        // Clear current input
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
        onChange(newPin.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      const chars = pastedData.split('');
      setPin(chars);
      onChange(pastedData);

      const newVis: Record<number, boolean> = {};
      chars.forEach((_, i) => {
        newVis[i] = true;
        if (timeouts.current[i]) clearTimeout(timeouts.current[i]);
        timeouts.current[i] = setTimeout(() => {
          setVisibleIndices(prev => ({ ...prev, [i]: false }));
        }, 1000);
      });
      setVisibleIndices(newVis);
      inputRefs.current[3]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
        4-Digit Login PIN
      </label>
      
      <div className="flex gap-3 justify-between">
        {pin.map((digit, index) => {
          // Display bullet character if value exists but index is masked
          const displayVal = digit ? (visibleIndices[index] ? digit : '•') : '';
          
          return (
            <input
              key={index}
              ref={el => {
                if (el) inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={displayVal}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onChange={e => handleChange(e.target.value, index)}
              className={`w-14 h-14 text-center text-xl font-extrabold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-300 transition-all dark:text-slate-100 placeholder-slate-300 ${
                error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''
              }`}
            />
          );
        })}
      </div>
      
      {error && (
        <span className="text-xxs font-medium text-rose-500 pl-0.5 mt-0.5">{error.message}</span>
      )}
    </div>
  );
};
