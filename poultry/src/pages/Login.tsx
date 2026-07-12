import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

// Auth sub-components
import { PhoneInput } from '../components/auth/PhoneInput';
import { PinInput } from '../components/auth/PinInput';
import { AnimatedButton } from '../components/auth/AnimatedButton';
import { LoginCard } from '../components/auth/LoginCard';
import { LoadingOverlay } from '../components/auth/LoadingOverlay';
import { ErrorModal } from '../components/auth/ErrorModal';
import { SuccessModal } from '../components/auth/SuccessModal';
import { ForgotPinModal } from '../components/auth/ForgotPinModal';

// Features List Icons
import { Truck, Receipt, Warehouse, Users, Landmark, BarChart3 } from 'lucide-react';

// Zod Validation Schema
const loginSchema = z.object({
  mobileNumber: z.string()
    .min(1, 'Phone number is required.')
    .regex(/^[0-9]+$/, 'Please enter a valid 10-digit mobile number.')
    .length(10, 'Please enter a valid 10-digit mobile number.'),
  pin: z.string()
    .min(1, 'Please enter your 4-digit PIN.')
    .length(4, 'PIN must be exactly 4 digits.')
    .regex(/^[0-9]+$/, 'PIN must contain numbers only.'),
  rememberMe: z.boolean().default(false),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();

  // Modal and submission states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileNumber: '',
      pin: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const success = await login(data.mobileNumber, data.pin);
      setIsLoading(false);
      
      if (success) {
        setIsSuccessOpen(true);
        // Persist "remember device" if checked
        if (data.rememberMe) {
          localStorage.setItem('sr_poultry_remembered_device', 'true');
        } else {
          localStorage.removeItem('sr_poultry_remembered_device');
        }
        
        // Wait 2 seconds, then navigate to home (Dashboard)
        setTimeout(() => {
          setIsSuccessOpen(false);
          navigate('/');
        }, 2000);
      } else {
        setIsErrorOpen(true);
      }
    } catch (err) {
      setIsLoading(false);
      setIsErrorOpen(true);
    }
  };

  const features = [
    { text: 'Purchase Management', icon: <Truck size={16} /> },
    { text: 'Sales Billing & Invoicing', icon: <Receipt size={16} /> },
    { text: 'Live Bird Inventory Tracking', icon: <Warehouse size={16} /> },
    { text: 'Customer & Supplier Records', icon: <Users size={16} /> },
    { text: 'Ledger Registers & Payments', icon: <Landmark size={16} /> },
    { text: 'Business Reports & Analytics', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#F8F9F5] text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* LEFT SIDE: Split Screen Brand Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-pink-100 overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Dark Soft Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-10 select-none pointer-events-none"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&q=80&w=1200")' }}
        />
        
        {/* Subtle Floating Decorative Feathers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/3 opacity-30 text-pink-300"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 8.5 11 8.5v9z" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/3 right-1/4 opacity-10 text-amber-200"
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 8.5 11 8.5v9z" />
            </svg>
          </motion.div>
        </div>

        {/* Top Branding Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-pink-300/50 p-2.5 rounded-xl border border-pink-400/30 text-pink-600 flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-9 4-9 11a9 9 0 0018 0c0-7-7.8-11-9-11z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-black tracking-wide leading-none margin-0">REDDY CHICKEN AND MUTTON POULTRY</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-black">Enterprise Solutions</span>
          </div>
        </div>

        {/* Main Pitch Title */}
        <div className="relative z-10 max-w-lg my-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl xl:text-5xl font-black text-black leading-tight tracking-tight margin-0"
          >
            Reddy Chicken and Mutton Poultry ERP
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-black/80 font-medium text-base xl:text-lg mt-3"
          >
            Smart Poultry Management & Billing Solution
          </motion.p>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-10">
            {features.map((f, i) => (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                key={i} 
                className="flex items-center gap-3 bg-white/40 border border-pink-900/10 rounded-xl p-3 backdrop-blur-xs"
              >
                <div className="text-pink-600 bg-pink-300/30 p-1.5 rounded-lg flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-xs font-semibold text-black">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Left Footer info */}
        <div className="relative z-10 border-t border-pink-900/10 pt-4 text-xxs font-medium text-black/80">
          Built for modern poultry wholesalers, distributors, and farms.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Card Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative min-h-screen">
        
        {/* Floating circles on background for aesthetics */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-900/20"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-500/2"></div>
        </div>

        {/* Mobile Header Branding */}
        <div className="flex justify-between items-center z-10 lg:hidden w-full mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-9 4-9 11a9 9 0 0018 0c0-7-7.8-11-9-11z" />
              </svg>
            </div>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Reddy Chicken and Mutton Poultry ERP</span>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="my-auto flex justify-center items-center w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
            className="w-full flex justify-center"
          >
            <LoginCard>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
                
                {/* Loader overlay during auth check */}
                <LoadingOverlay isVisible={isLoading} />

                {/* Mobile Input Field */}
                <PhoneInput
                  label="Mobile Number *"
                  placeholder="Enter your mobile number"
                  error={errors.mobileNumber}
                  {...register('mobileNumber')}
                />

                {/* PIN Code Input Field */}
                <PinInput
                  error={errors.pin}
                  onChange={(val) => setValue('pin', val, { shouldValidate: true })}
                />

                {/* Auxiliary Form Controls (Forgot PIN) */}
                <div className="flex items-center justify-end text-xxs font-semibold select-none pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-pink-400 hover:text-pink-600 dark:text-pink-300 dark:hover:text-white transition cursor-pointer font-bold"
                  >
                    Forgot PIN?
                  </button>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <AnimatedButton isLoading={isLoading} text="Login to Panel" />
                </div>
              </form>
            </LoginCard>
          </motion.div>
        </div>

        {/* Footer info panel */}
        <div className="z-10 text-center text-[10px] text-slate-400 dark:text-slate-500 pt-8 border-t border-slate-100 dark:border-slate-900 w-full mt-8 select-none">
          <p className="margin-0">Version 1.0.0 • © 2026 Reddy Chicken and Mutton Poultry ERP</p>
          <p className="margin-0 mt-1 font-medium">Built for modern poultry wholesalers and distributors.</p>
        </div>
      </div>

      {/* Success Modal Popup */}
      <SuccessModal isOpen={isSuccessOpen} />

      {/* Forgot PIN Workflow Modal */}
      <ForgotPinModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />

      {/* Error Modal Popup */}
      <ErrorModal 
        isOpen={isErrorOpen} 
        onClose={() => setIsErrorOpen(false)}
        onTryAgain={() => {
          setIsErrorOpen(false);
          // Let inputs regain focus
        }}
      />
    </div>
  );
};
