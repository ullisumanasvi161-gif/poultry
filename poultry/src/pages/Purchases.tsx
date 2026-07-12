import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormElements';
import { formatCurrency, formatWeight, formatDate, getPurchaseWhatsAppText } from '../utils/helpers';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Printer, Share2, Download, History, Plus, FileText, CheckCircle } from 'lucide-react';
import { ChickenType, Purchase } from '../types';

const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Please select a supplier'),
  date: z.string().min(1, 'Please select a date'),
  chickenType: z.enum(['Broiler (Live)', 'Country Chicken'] as const),
  weight: z.coerce.number().positive('Weight must be greater than 0'),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
  transportCharge: z.coerce.number().min(0, 'Transport charge must be 0 or positive').default(0),
  loadingCharge: z.coerce.number().min(0, 'Loading charge must be 0 or positive').default(0),
  commission: z.coerce.number().min(0, 'Commission must be 0 or positive').default(0),
  discount: z.coerce.number().min(0, 'Discount must be 0 or positive').default(0),
  gst: z.coerce.number().default(0),
  paymentMethod: z.enum(['Credit', 'Cash', 'Bank Transfer', 'UPI'] as const),
});

type PurchaseFormInput = z.infer<typeof purchaseSchema>;

export const Purchases: React.FC = () => {
  const { suppliers, purchases, addPurchase, settings, toast } = useApp();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  // Selected purchase for receipt view
  const [selectedReceipt, setSelectedReceipt] = useState<Purchase | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: '',
      date: new Date().toISOString().slice(0, 10),
      chickenType: 'Broiler (Live)',
      weight: 0,
      rate: 0,
      transportCharge: 0,
      loadingCharge: 0,
      commission: 0,
      discount: 0,
      gst: 0,
      paymentMethod: 'Credit',
    }
  });

  // Watch fields for live calculation
  const watchedFields = useWatch({
    control,
  });

  // Extract variables with defaults
  const weight = Number(watchedFields.weight || 0);
  const rate = Number(watchedFields.rate || 0);
  const transportCharge = Number(watchedFields.transportCharge || 0);
  const loadingCharge = Number(watchedFields.loadingCharge || 0);
  const commission = Number(watchedFields.commission || 0);
  const discount = Number(watchedFields.discount || 0);
  const gst = Number(watchedFields.gst || 5);

  // Calculation results
  const subtotal = weight * rate;
  const taxableValue = Math.max(0, subtotal - discount);
  const gstAmount = (taxableValue * gst) / 100;
  const totalAmount = Math.round(taxableValue + gstAmount + transportCharge + loadingCharge + commission);

  const onSubmit = (data: any) => {
    // Inject calculated total
    addPurchase({
      ...data,
      totalAmount,
    });
    
    // Set active tab to history to see the entry
    setActiveTab('history');
    reset({
      supplierId: '',
      date: new Date().toISOString().slice(0, 10),
      chickenType: 'Broiler (Live)',
      weight: 0,
      rate: 0,
      transportCharge: 0,
      loadingCharge: 0,
      commission: 0,
      discount: 0,
      gst: 5,
      paymentMethod: 'Credit',
    });
  };

  const handlePrint = (p: Purchase) => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    const printContainer = document.getElementById('print-frame-container');
    if (!printContainer) return;
    
    const taxable = p.weight * p.rate - p.discount;
    const taxAmt = (taxable * p.gst) / 100;

    printContainer.innerHTML = `
      <div style="font-family: 'Courier New', monospace; padding: 20px; color: #000; width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #000;">
        <center>
          <h2 style="margin: 0; text-transform: uppercase;">${settings.companyName}</h2>
          <p style="margin: 5px 0; font-size: 11px;">${settings.address}<br>Phone: ${settings.phone} • GSTIN: ${settings.gstNumber}</p>
          <hr style="border-top: 1px dashed #000; margin: 10px 0;">
          <h3 style="margin: 5px 0;">PURCHASE RECEIPT</h3>
        </center>
        
        <table style="width: 100%; font-size: 11px; margin: 15px 0;">
          <tr>
            <td><strong>Receipt No:</strong> ${p.purchaseNumber}</td>
            <td style="text-align: right;"><strong>Date:</strong> ${formatDate(p.date)}</td>
          </tr>
          <tr>
            <td><strong>Supplier:</strong> ${supplier?.name || 'Cash Party'}</td>
            <td style="text-align: right;"><strong>GSTIN:</strong> ${supplier?.gstNumber || 'N/A'}</td>
          </tr>
        </table>
        
        <hr style="border-top: 1px dashed #000; margin: 10px 0;">
        
        <table style="width: 100%; font-size: 11px; text-align: left; margin-bottom: 10px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th>Item Name</th>
              <th style="text-align: right;">Weight</th>
              <th style="text-align: right;">Rate/KG</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${p.chickenType}</td>
              <td style="text-align: right;">${formatWeight(p.weight)}</td>
              <td style="text-align: right;">${formatCurrency(p.rate)}</td>
              <td style="text-align: right;">${formatCurrency(p.weight * p.rate)}</td>
            </tr>
          </tbody>
        </table>

        <hr style="border-top: 1px dashed #000; margin: 10px 0;">

        <div style="font-size: 11px; text-align: right; width: 100%; max-width: 300px; margin-left: auto;">
          <table style="width: 100%;">
            <tr><td>Subtotal:</td><td style="text-align: right;">${formatCurrency(p.weight * p.rate)}</td></tr>
            <tr><td>Discount:</td><td style="text-align: right;">-${formatCurrency(p.discount)}</td></tr>
            <tr><td>Taxable Value:</td><td style="text-align: right;">${formatCurrency(taxable)}</td></tr>
            <tr><td>GST (${p.gst}%):</td><td style="text-align: right;">${formatCurrency(taxAmt)}</td></tr>
            <tr><td>Transport:</td><td style="text-align: right;">${formatCurrency(p.transportCharge)}</td></tr>
            <tr><td>Loading Charge:</td><td style="text-align: right;">${formatCurrency(p.loadingCharge)}</td></tr>
            <tr><td>Commission:</td><td style="text-align: right;">${formatCurrency(p.commission)}</td></tr>
            <tr style="font-weight: bold; border-top: 1px solid #000;">
              <td>Grand Total:</td>
              <td style="text-align: right; font-size: 13px;">${formatCurrency(p.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <hr style="border-top: 1px dashed #000; margin: 20px 0 10px 0;">
        
        <table style="width: 100%; font-size: 10px;">
          <tr>
            <td><strong>Payment Method:</strong> ${p.paymentMethod}</td>
            <td style="text-align: right;">Authorized Signature: _________________</td>
          </tr>
        </table>
      </div>
    `;
    
    window.print();
    setTimeout(() => {
      printContainer.innerHTML = '';
    }, 1000);
  };

  const handleShareWhatsApp = (p: Purchase) => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    const text = getPurchaseWhatsAppText(p, supplier?.name || 'Cash Party', settings.companyName);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleMockDownloadPDF = (p: Purchase) => {
    toast.show(`PDF Receipt for ${p.purchaseNumber} generated and downloaded!`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Purchase Billing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record batch purchases from poultry farms, with live price calculation and tax logs.
          </p>
        </div>

        <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900 select-none no-print">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'create' 
                ? 'bg-emerald-600 text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <Plus size={14} /> Log Purchase
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'history' 
                ? 'bg-emerald-600 text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <History size={14} /> Receipt Archives
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Billing Form (left 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-3 mb-5 dark:border-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" /> Purchase Entry Form
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Select Supplier *"
                  options={[
                    { value: '', label: 'Select a supplier...' },
                    ...suppliers.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  error={errors.supplierId?.message}
                  {...register('supplierId')}
                />
                <Input
                  label="Purchase Date *"
                  type="date"
                  error={errors.date?.message}
                  {...register('date')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Chicken Type *"
                  options={[
                    { value: 'Broiler (Live)', label: 'Broiler (Live)' },
                    { value: 'Country Chicken', label: 'Country Chicken' },
                  ]}
                  error={errors.chickenType?.message}
                  {...register('chickenType')}
                />
                <Input
                  label="Weight (KG) *"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1500"
                  error={errors.weight?.message}
                  {...register('weight')}
                />
                <Input
                  label="Rate per KG (INR) *"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 110"
                  error={errors.rate?.message}
                  {...register('rate')}
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Additional Charges & Discounts</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Transport Charge"
                    type="number"
                    error={errors.transportCharge?.message}
                    {...register('transportCharge')}
                  />
                  <Input
                    label="Loading Charge"
                    type="number"
                    error={errors.loadingCharge?.message}
                    {...register('loadingCharge')}
                  />
                  <Input
                    label="Commission"
                    type="number"
                    error={errors.commission?.message}
                    {...register('commission')}
                  />
                  <Input
                    label="Discount"
                    type="number"
                    error={errors.discount?.message}
                    {...register('discount')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                <Select
                  label="GST (Tax Rate) *"
                  options={[
                    { value: 0, label: 'Exempt (0%)' },
                    { value: 5, label: 'Standard (5%)' },
                    { value: 12, label: 'Processed (12%)' },
                    { value: 18, label: 'Premium (18%)' },
                  ]}
                  error={errors.gst?.message}
                  {...register('gst')}
                />
                <Select
                  label="Payment Policy *"
                  options={[
                    { value: 'Credit', label: 'Credit (Outstanding)' },
                    { value: 'Cash', label: 'Cash Payment' },
                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                    { value: 'UPI', label: 'UPI / QR Scan' },
                  ]}
                  error={errors.paymentMethod?.message}
                  {...register('paymentMethod')}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                <Button size="lg" type="submit" leftIcon={<CheckCircle size={18} />}>
                  Save Purchase Receipt
                </Button>
              </div>
            </form>
          </div>

          {/* Receipt Preview (right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
            <Card className="bg-slate-900 border-slate-800 text-white font-mono text-xs flex flex-col gap-4 shadow-xl">
              <div className="border-b border-dashed border-slate-800 pb-3 text-center">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{settings.companyName}</h4>
                <p className="text-xxs text-slate-400 mt-1">{settings.address}</p>
                <p className="text-xxs text-slate-400">GST: {settings.gstNumber}</p>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-800 pb-3">
                <div className="flex justify-between">
                  <span>RECEIPT NO:</span>
                  <span className="text-emerald-400">SBP/PUR/2026/XXX</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{formatDate(watchedFields.date || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span>SUPPLIER:</span>
                  <span className="truncate max-w-[150px]">
                    {suppliers.find(s => s.id === watchedFields.supplierId)?.name || 'CASH PARTY'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-800 pb-3">
                <div className="flex justify-between font-bold text-white">
                  <span>ITEM DESCRIPTION</span>
                  <span>TOTAL</span>
                </div>
                <div className="flex justify-between">
                  <span>{watchedFields.chickenType}</span>
                  <span>{formatWeight(weight)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xxs pl-3">
                  <span>Rate per KG:</span>
                  <span>{formatCurrency(rate)}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-right font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span>{formatCurrency(taxableValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({gst}%):</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport & Loading:</span>
                  <span>{formatCurrency(transportCharge + loadingCharge)}</span>
                </div>
                {commission > 0 && (
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <span>{formatCurrency(commission)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400 font-bold border-t border-dashed border-slate-800 pt-2 text-sm leading-none">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-800 pt-3 text-center text-xxs text-slate-400">
                Payment Type: {watchedFields.paymentMethod || 'Credit'}
              </div>
            </Card>
            <div className="text-center text-xxs text-slate-455">
              💡 Form inputs update the billing preview in real-time. Verify totals before saving.
            </div>
          </div>
        </div>
      ) : (
        /* Purchase Archives (History Tab) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
          <Table
            data={purchases}
            searchPlaceholder="Search receipts by number or supplier..."
            enableSearch={true}
            searchKeys={['purchaseNumber']}
            pageSize={10}
            columns={[
              { header: 'Receipt No', accessorKey: 'purchaseNumber', sortable: true },
              { header: 'Supplier', cell: (row) => suppliers.find(s => s.id === row.supplierId)?.name || 'Unknown' },
              { header: 'Date', accessorKey: 'date', sortable: true, cell: (row) => formatDate(row.date) },
              { header: 'Chicken Type', accessorKey: 'chickenType' },
              { header: 'Weight', cell: (row) => formatWeight(row.weight) },
              { header: 'Total Value', cell: (row) => formatCurrency(row.totalAmount) },
              { header: 'Method', accessorKey: 'paymentMethod' },
              {
                header: 'Receipt Actions',
                cell: (row) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handlePrint(row)} className="hover:text-emerald-500">
                      <Printer size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShareWhatsApp(row)} className="hover:text-emerald-500">
                      <Share2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleMockDownloadPDF(row)} className="hover:text-emerald-500">
                      <Download size={14} />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
