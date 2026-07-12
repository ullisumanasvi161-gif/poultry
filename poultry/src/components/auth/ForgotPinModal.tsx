import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, ArrowLeft, X, Lock, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// -------------------------------------------------------------
// PROGRESS STEPPER COMPONENT
// -------------------------------------------------------------
const ProgressStepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <div className="w-full flex flex-col items-center mb-6 mt-1 select-none">
      <div className="flex items-center justify-between w-full max-w-[280px] text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        <span className={currentStep >= 1 ? 'text-[#2E7D32] dark:text-[#81C784]' : ''}>Mobile</span>
        <span className={currentStep >= 2 ? 'text-[#2E7D32] dark:text-[#81C784]' : ''}>Security</span>
        <span className={currentStep >= 3 ? 'text-[#2E7D32] dark:text-[#81C784]' : ''}>Reset</span>
      </div>
      <div className="flex items-center w-full max-w-[280px] justify-center px-2">
        {/* Step 1 Circle */}
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 border ${
          currentStep >= 1 
            ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-xs' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`} />
        
        {/* Line 1 */}
        <div className={`h-0.5 flex-1 transition-all duration-300 ${
          currentStep >= 2 ? 'bg-[#2E7D32]' : 'bg-slate-200 dark:bg-slate-800'
        }`} />
        
        {/* Step 2 Circle */}
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 border ${
          currentStep >= 2 
            ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-xs' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`} />
        
        {/* Line 2 */}
        <div className={`h-0.5 flex-1 transition-all duration-300 ${
          currentStep >= 3 ? 'bg-[#2E7D32]' : 'bg-slate-200 dark:bg-slate-800'
        }`} />
        
        {/* Step 3 Circle */}
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 border ${
          currentStep >= 3 
            ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-xs' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`} />
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// PIN CODE INPUT GROUP (Step 3 Helper)
// -------------------------------------------------------------
interface PinCodeGroupProps {
  label: string;
  onChange: (pin: string) => void;
}

const PinCodeGroup: React.FC<PinCodeGroupProps> = ({ label, onChange }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [visibleIndices, setVisibleIndices] = useState<Record<number, boolean>>({});
  
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const timeouts = useRef<Record<number, any>>({});

  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout);
    };
  }, []);

  const handleChange = (val: string, index: number) => {
    const lastChar = val.replace(/[^0-9]/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = lastChar;
    setPin(newPin);
    
    onChange(newPin.join(''));

    if (lastChar) {
      setVisibleIndices(prev => ({ ...prev, [index]: true }));
      
      if (timeouts.current[index]) clearTimeout(timeouts.current[index]);
      timeouts.current[index] = setTimeout(() => {
        setVisibleIndices(prev => ({ ...prev, [index]: false }));
      }, 1000);

      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        onChange(newPin.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (pin[index]) {
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
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
      <div className="flex gap-2.5">
        {pin.map((digit, idx) => {
          const val = digit ? (visibleIndices[idx] ? digit : '•') : '';
          return (
            <input
              key={idx}
              ref={el => { if (el) inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onKeyDown={e => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              onChange={e => handleChange(e.target.value, idx)}
              className="w-10 h-10 text-center text-md font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100 placeholder-slate-300"
            />
          );
        })}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MAIN FORGOT PIN MODAL FLOW
// -------------------------------------------------------------
export const ForgotPinModal: React.FC<ForgotPinModalProps> = ({ isOpen, onClose }) => {
  const { updatePin, settings } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Verification Values
  const [mobile, setMobile] = useState<string>('');
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');

  // Inline Validation Errors
  const [mobileError, setMobileError] = useState<string>('');
  const [answerError, setAnswerError] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Overlay Error Alerts
  const [showAccountNotFound, setShowAccountNotFound] = useState<boolean>(false);
  const [showVerificationFailed, setShowVerificationFailed] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMobile('');
      setSecurityAnswer('');
      setNewPin('');
      setConfirmPin('');
      setMobileError('');
      setAnswerError('');
      setPinError('');
      setShowAccountNotFound(false);
      setShowVerificationFailed(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Step 1: Submit Mobile Number
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim()) {
      setMobileError('Phone number is required.');
      return;
    }
    if (mobile.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setMobileError('');
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    // Mock validation: registered mobile is settings.managerMobile
    if (mobile === settings.managerMobile) {
      setStep(2);
    } else {
      setShowAccountNotFound(true);
    }
  };

  // Step 2: Submit Security Answer
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setAnswerError('Answer is required.');
      return;
    }
    setAnswerError('');
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    // Mock validation: answer is case-insensitive settings.securityAnswer
    if (securityAnswer.trim().toLowerCase() === settings.securityAnswer.trim().toLowerCase()) {
      setStep(3);
    } else {
      setShowVerificationFailed(true);
    }
  };

  // Step 3: Update PIN Submit
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setPinError('Please enter your 4-digit PIN in both fields.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }

    // Check old PIN constraint
    if (newPin === '1234') {
      setPinError('New PIN cannot be the same as the old PIN.');
      return;
    }

    // Check weak PIN criteria
    const weakPins = ['0000', '1111', '4444', '9999', '1234'];
    if (weakPins.includes(newPin)) {
      setPinError('Please choose a stronger PIN.');
      return;
    }

    setIsSubmitting(true);
    // Simulate updating API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    // Save and update AppContext state
    updatePin(newPin);
    setShowSuccess(true);

    // Redirect to login after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="w-full max-w-md relative z-10 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6.5 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Stepper Progress */}
            <ProgressStepper currentStep={step} />

            {/* Verification Steps Content */}
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Verify Mobile */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Forgot Your PIN?
                  </h3>
                  <p className="text-xxs text-slate-400 mt-1 mb-5">
                    Enter your registered mobile number to verify your identity.
                  </p>

                  <form onSubmit={handleMobileSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Enter registered mobile number"
                          className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100 placeholder-slate-400 ${
                            mobileError ? 'border-rose-500 focus:ring-rose-500/20' : ''
                          }`}
                        />
                      </div>
                      {mobileError && (
                        <span className="text-xxs font-medium text-rose-500 pl-0.5">{mobileError}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xxs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold text-xxs rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        {isSubmitting ? 'Verifying...' : 'Continue'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: Security Verification */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Security Verification
                  </h3>
                  <p className="text-xxs text-slate-400 mt-1 mb-5">
                    Answer the security challenge to verify your ownership.
                  </p>

                  <form onSubmit={handleAnswerSubmit} className="space-y-4">
                    
                    {/* Security Question Panel */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Security Question</span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-250 mt-0.5">
                        "{settings.securityQuestion}"
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                        Answer Field
                      </label>
                      <input
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100 placeholder-slate-400 ${
                          answerError ? 'border-rose-500 focus:ring-rose-500/20' : ''
                        }`}
                      />
                      {answerError && (
                        <span className="text-xxs font-medium text-rose-500 pl-0.5">{answerError}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xxs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft size={10} /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold text-xxs rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        {isSubmitting ? 'Checking...' : 'Verify Answer'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: Reset PIN */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Create New PIN
                  </h3>
                  <p className="text-xxs text-slate-400 mt-1 mb-5">
                    Choose a secure 4-digit PIN for logging in.
                  </p>

                  <form onSubmit={handlePinSubmit} className="space-y-4">
                    
                    {/* New PIN box inputs */}
                    <PinCodeGroup label="New PIN *" onChange={(pin) => setNewPin(pin)} />

                    {/* Confirm PIN box inputs */}
                    <PinCodeGroup label="Confirm PIN *" onChange={(pin) => setConfirmPin(pin)} />

                    {pinError && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2.5 rounded-lg text-rose-500 text-xxs font-semibold flex items-center gap-1.5">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        <span>{pinError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xxs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer flex items-center gap-1"
                      >
                        <ArrowLeft size={10} /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold text-xxs rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        {isSubmitting ? 'Updating...' : 'Update PIN'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* -------------------------------------------------------------
                ACCOUNT NOT FOUND MODAL OVERLAY (Step 1 error)
                ------------------------------------------------------------- */}
            <AnimatePresence>
              {showAccountNotFound && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex flex-col items-center p-4 text-center"
                  >
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-full border border-rose-100 dark:border-rose-900/30 text-rose-500 w-14 h-14 flex items-center justify-center mb-4">
                      <AlertCircle size={28} />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Account Not Found</h4>
                    <p className="text-xxs text-slate-500 dark:text-slate-450 mt-1.5 mb-6 max-w-[240px] leading-normal">
                      No account is registered with this mobile number.
                    </p>
                    <button
                      onClick={() => setShowAccountNotFound(false)}
                      className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold text-xxs rounded-xl cursor-pointer shadow-sm select-none"
                    >
                      Try Again
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* -------------------------------------------------------------
                VERIFICATION FAILED MODAL OVERLAY (Step 2 error)
                ------------------------------------------------------------- */}
            <AnimatePresence>
              {showVerificationFailed && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex flex-col items-center p-4 text-center"
                  >
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-full border border-rose-100 dark:border-rose-900/30 text-rose-500 w-14 h-14 flex items-center justify-center mb-4 animate-pulse">
                      <Lock size={26} />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Verification Failed</h4>
                    <p className="text-xxs text-slate-500 dark:text-slate-450 mt-1.5 mb-6 max-w-[240px] leading-normal">
                      The answer you entered is incorrect.
                    </p>
                    
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setShowVerificationFailed(false)}
                        className="px-5 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold text-xxs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowVerificationFailed(false);
                          setSecurityAnswer('');
                        }}
                        className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B4332] text-white font-bold text-xxs rounded-xl cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* -------------------------------------------------------------
                SUCCESS MODAL OVERLAY (Step 3 final success)
                ------------------------------------------------------------- */}
            <AnimatePresence>
              {showSuccess && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex flex-col items-center p-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 w-16 h-16 flex items-center justify-center mb-4"
                    >
                      <CheckCircle size={32} />
                    </motion.div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">PIN Updated Successfully</h4>
                    <p className="text-xxs text-slate-500 dark:text-slate-450 mt-1.5 max-w-[280px] leading-relaxed">
                      Your login PIN has been changed successfully. You can now log in using your new PIN.
                    </p>
                    
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-450 font-bold mt-4 animate-pulse">
                      Closing dialog...
                    </p>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
