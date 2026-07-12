import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/FormElements';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings as SettingsIcon, Save, Shield } from 'lucide-react';
import { Settings } from '../types';

const settingsSchema = z.object({
  companyName: z.string().min(3, 'Company name is required'),
  phone: z.string().min(10, 'Contact number is required'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(5, 'Company address is required'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').or(z.literal('')),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  receiptPrefix: z.string().min(1, 'Receipt prefix is required'),
  termsAndConditions: z.string().min(1, 'Terms and conditions are required'),
  printerWidth: z.enum(['58mm', '80mm'] as const),
  language: z.enum(['English', 'Hindi', 'Telugu'] as const),
  theme: z.enum(['light', 'dark'] as const),
  managerMobile: z.string().length(10, 'Mobile number must be exactly 10 digits'),
  securityQuestion: z.string().min(3, 'Security question is required'),
  securityAnswer: z.string().min(1, 'Security answer is required'),
  loginPin: z.string().length(4, 'PIN must be exactly 4 digits'),
});

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (data: Settings) => {
    updateSettings(data);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            System Settings
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            Configure company invoices, tax configurations, printing preferences, and database backups.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Core Settings Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-800">
              <SettingsIcon size={18} className="text-emerald-500" /> Company Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registered Trade Name *"
                error={errors.companyName?.message}
                {...register('companyName')}
              />
              <Input
                label="GSTIN Number *"
                error={errors.gstNumber?.message}
                {...register('gstNumber')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Contact *"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Email Address *"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <Input
              label="Warehouse / Farm Address *"
              error={errors.address?.message}
              {...register('address')}
            />
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-800">
              Billing Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Invoice Reference Prefix *"
                error={errors.invoicePrefix?.message}
                {...register('invoicePrefix')}
              />
              <Input
                label="Purchase Reference Prefix *"
                error={errors.receiptPrefix?.message}
                {...register('receiptPrefix')}
              />
            </div>

            <Textarea
              label="Standard Invoice Terms & Conditions *"
              error={errors.termsAndConditions?.message}
              {...register('termsAndConditions')}
            />
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-800">
              Interface Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Thermal Printer Roll width *"
                options={[
                  { value: '80mm', label: '80mm width (Standard)' },
                  { value: '58mm', label: '58mm width (Compact)' },
                ]}
                error={errors.printerWidth?.message}
                {...register('printerWidth')}
              />
              <Select
                label="Language Translation *"
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'Hindi', label: 'Hindi (हिंदी)' },
                  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
                ]}
                error={errors.language?.message}
                {...register('language')}
              />
              <Select
                label="System Theme UI *"
                options={[
                  { value: 'light', label: 'Light Mode' },
                  { value: 'dark', label: 'Dark Mode' },
                ]}
                error={errors.theme?.message}
                {...register('theme')}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-800">
              <Shield size={18} className="text-emerald-500" /> Security & ERP Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registered Manager Mobile *"
                placeholder="e.g. 9876543210"
                error={errors.managerMobile?.message}
                {...register('managerMobile')}
              />
              <Input
                label="4-Digit Login PIN *"
                placeholder="e.g. 1234"
                maxLength={4}
                error={errors.loginPin?.message}
                {...register('loginPin')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Security Question *"
                options={[
                  { value: 'What is your favourite food?', label: 'What is your favourite food?' },
                  { value: "What is your mother's first name?", label: "What is your mother's first name?" },
                  { value: 'What is your birthplace?', label: 'What is your birthplace?' },
                  { value: 'What was your first school?', label: 'What was your first school?' },
                  { value: 'What is your favourite colour?', label: 'What is your favourite colour?' },
                ]}
                error={errors.securityQuestion?.message}
                {...register('securityQuestion')}
              />
              <Input
                label="Security Question Answer *"
                placeholder="Answer to security question"
                error={errors.securityAnswer?.message}
                {...register('securityAnswer')}
              />
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button size="lg" type="submit" leftIcon={<Save size={18} />}>
              Save Config Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
