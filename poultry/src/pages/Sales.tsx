import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormElements';
import { formatCurrency, formatWeight, formatDate, getSalesWhatsAppText } from '../utils/helpers';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Printer, Share2, Download, History, Plus, FileText, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { Sales } from '../types';

const salesSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  date: z.string().min(1, 'Please select a date'),
  chickenType: z.enum(['Broiler (Live)', 'Country Chicken'] as const),
  weight: z.coerce.number().positive('Weight must be greater than 0'),
  sellingRate: z.coerce.number().positive('Selling rate must be greater than 0'),
  discount: z.coerce.number().min(0, 'Discount must be 0 or positive').default(0),
  packingCharge: z.coerce.number().min(0, 'Packing charge must be 0 or positive').default(0),
  deliveryCharge: z.coerce.number().min(0, 'Delivery charge must be 0 or positive').default(0),
  gst: z.coerce.number().default(0),
  paymentType: z.enum(['Credit', 'Cash', 'Bank Transfer', 'UPI'] as const),
});

type SalesFormInput = z.infer<typeof salesSchema>;

export const SalesBilling: React.FC = () => {
  const { customers, sales, addSales, settings, toast } = useApp();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [previewFormat, setPreviewFormat] = useState<'A4' | 'thermal'>('A4');

  // Form Setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      customerId: '',
      date: new Date().toISOString().slice(0, 10),
      chickenType: 'Broiler (Live)',
      weight: 0,
      sellingRate: 0,
      discount: 0,
      packingCharge: 0,
      deliveryCharge: 0,
      gst: 0,
      paymentType: 'Credit',
    }
  });

  // Watch fields
  const watchedFields = useWatch({ control });

  const weight = Number(watchedFields.weight || 0);
  const sellingRate = Number(watchedFields.sellingRate || 0);
  const discount = Number(watchedFields.discount || 0);
  const packingCharge = Number(watchedFields.packingCharge || 0);
  const deliveryCharge = Number(watchedFields.deliveryCharge || 0);
  const gst = Number(watchedFields.gst || 5);

  const subtotal = weight * sellingRate;
  const taxableValue = Math.max(0, subtotal - discount);
  const gstAmount = (taxableValue * gst) / 100;
  const totalAmount = Math.round(taxableValue + gstAmount + packingCharge + deliveryCharge);

  const onSubmit = (data: any) => {
    addSales({
      ...data,
      totalAmount,
    });
    setActiveTab('history');
    reset({
      customerId: '',
      date: new Date().toISOString().slice(0, 10),
      chickenType: 'Broiler (Live)',
      weight: 0,
      sellingRate: 0,
      discount: 0,
      packingCharge: 0,
      deliveryCharge: 0,
      gst: 5,
      paymentType: 'Credit',
    });
  };

  const handlePrint = (s: Sales, format: 'A4' | 'thermal') => {
    const customer = customers.find(c => c.id === s.customerId);
    const printContainer = document.getElementById('print-frame-container');
    if (!printContainer) return;

    const taxable = s.weight * s.sellingRate - s.discount;
    const taxAmt = (taxable * s.gst) / 100;

    if (format === 'thermal') {
      // Print as compact receipt (80mm/58mm format)
      printContainer.innerHTML = `
        <div style="font-family: 'Courier New', monospace; padding: 10px; color: #000; width: 100%; max-width: 300px; margin: 0 auto; border: 1px solid #ccc; font-size: 11px;">
          <center>
            <h3 style="margin: 0; text-transform: uppercase;">${settings.companyName}</h3>
            <p style="margin: 3px 0; font-size: 9px;">${settings.address}<br>Phone: ${settings.phone}</p>
            <hr style="border-top: 1px dashed #000; margin: 5px 0;">
            <p style="margin: 2px 0;"><strong>INVOICE</strong></p>
          </center>
          
          <table style="width: 100%; font-size: 9px; margin: 8px 0;">
            <tr><td>Inv No: ${s.invoiceNumber}</td><td style="text-align: right;">Date: ${formatDate(s.date)}</td></tr>
            <tr><td colspan="2">Shop: ${customer?.shopName || 'Retail Customer'}</td></tr>
          </table>
          
          <hr style="border-top: 1px dashed #000; margin: 5px 0;">
          
          <table style="width: 100%; font-size: 9px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th>Item</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${s.chickenType}</td>
                <td style="text-align: right;">${formatWeight(s.weight)}</td>
                <td style="text-align: right;">${s.sellingRate}</td>
                <td style="text-align: right;">${formatCurrency(s.weight * s.sellingRate)}</td>
              </tr>
            </tbody>
          </table>
          
          <hr style="border-top: 1px dashed #000; margin: 5px 0;">
          
          <div style="font-size: 9px; text-align: right; width: 100%;">
            <table style="width: 100%;">
              <tr><td>Subtotal:</td><td style="text-align: right;">${formatCurrency(s.weight * s.sellingRate)}</td></tr>
              <tr><td>Discount:</td><td style="text-align: right;">-${formatCurrency(s.discount)}</td></tr>
              <tr><td>GST (${s.gst}%):</td><td style="text-align: right;">${formatCurrency(taxAmt)}</td></tr>
              <tr><td>Charges:</td><td style="text-align: right;">${formatCurrency(s.packingCharge + s.deliveryCharge)}</td></tr>
              <tr style="font-weight: bold; border-top: 1px solid #000;">
                <td>Net Total:</td>
                <td style="text-align: right;">${formatCurrency(s.totalAmount)}</td>
              </tr>
            </table>
          </div>
          
          <hr style="border-top: 1px dashed #000; margin: 10px 0 5px 0;">
          <center><p style="margin: 0; font-size: 8px;">Thank You! Please Visit Again.</p></center>
        </div>
      `;
    } else {
      // Print as formal A4 Invoice
      printContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #000; line-height: 1.5;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td>
                <h1 style="color: #059669; margin: 0; text-transform: uppercase;">TAX INVOICE</h1>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Invoice No: <strong>${s.invoiceNumber}</strong><br>Date: ${formatDate(s.date)}</p>
              </td>
              <td style="text-align: right;">
                <h2 style="margin: 0; color: #1e293b;">${settings.companyName}</h2>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">
                  ${settings.address}<br>
                  Phone: ${settings.phone} • Email: ${settings.email}<br>
                  <strong>GSTIN: ${settings.gstNumber}</strong>
                </p>
              </td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 12px;">
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <td style="padding: 10px; width: 50%;"><strong>BILLED TO:</strong></td>
              <td style="padding: 10px; width: 50%;"><strong>TRANSPORT / POLICY:</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; vertical-align: top;">
                <strong>${customer?.shopName || 'Retail Customer'}</strong><br>
                Proprietor: ${customer?.name || 'Walk-in'}<br>
                Phone: ${customer?.phone || 'N/A'}<br>
                GSTIN: ${customer?.gstNumber || 'N/A'}<br>
                Address: ${customer?.address || 'N/A'}
              </td>
              <td style="padding: 10px; vertical-align: top;">
                Payment Type: ${s.paymentType}<br>
                Delivery Charge: ${formatCurrency(s.deliveryCharge)}<br>
                Packing Charge: ${formatCurrency(s.packingCharge)}
              </td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; text-align: left;">
            <thead>
              <tr style="background: #059669; color: #fff;">
                <th style="padding: 12px 10px;">Item Description</th>
                <th style="padding: 12px 10px; text-align: right;">Weight (Qty)</th>
                <th style="padding: 12px 10px; text-align: right;">Rate / KG</th>
                <th style="padding: 12px 10px; text-align: right;">Taxable Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 10px;">${s.chickenType}</td>
                <td style="padding: 12px 10px; text-align: right;">${formatWeight(s.weight)}</td>
                <td style="padding: 12px 10px; text-align: right;">${formatCurrency(s.sellingRate)}</td>
                <td style="padding: 12px 10px; text-align: right;">${formatCurrency(s.weight * s.sellingRate)}</td>
              </tr>
            </tbody>
          </table>

          <table style="width: 100%; font-size: 12px; margin-top: 20px;">
            <tr>
              <td style="width: 55%; vertical-align: top;"></td>
              <td style="width: 45%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 6px 0;">Subtotal:</td><td style="text-align: right; padding: 6px 0;">${formatCurrency(s.weight * s.sellingRate)}</td></tr>
                  <tr><td style="padding: 6px 0;">Discount:</td><td style="text-align: right; padding: 6px 0; color: #ef4444;">-${formatCurrency(s.discount)}</td></tr>
                  <tr><td style="padding: 6px 0; border-top: 1px solid #e2e8f0;">Taxable Value:</td><td style="text-align: right; padding: 6px 0; border-top: 1px solid #e2e8f0;">${formatCurrency(taxable)}</td></tr>
                  <tr><td style="padding: 6px 0;">GST (${s.gst}%):</td><td style="text-align: right; padding: 6px 0;">${formatCurrency(taxAmt)}</td></tr>
                  <tr><td style="padding: 6px 0;">Packing + Delivery:</td><td style="text-align: right; padding: 6px 0;">${formatCurrency(s.packingCharge + s.deliveryCharge)}</td></tr>
                  <tr style="font-weight: bold; border-top: 2px solid #e2e8f0; font-size: 14px; color: #059669;">
                    <td style="padding: 10px 0;">Invoice Total:</td>
                    <td style="text-align: right; padding: 10px 0;">${formatCurrency(s.totalAmount)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="margin-top: 80px; font-size: 11px;">
            <table style="width: 100%;">
              <tr>
                <td>Customer Signature: _____________________</td>
                <td style="text-align: right;">For <strong>${settings.companyName}</strong><br><br><br>Authorized Signatory</td>
              </tr>
            </table>
          </div>
        </div>
      `;
    }

    window.print();
    setTimeout(() => {
      printContainer.innerHTML = '';
    }, 1000);
  };

  const handleShareWhatsApp = (s: Sales) => {
    const customer = customers.find(c => c.id === s.customerId);
    const text = getSalesWhatsAppText(s, customer?.name || 'Walk-in', customer?.shopName || 'Walk-in', settings.companyName);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleMockDownloadPDF = (s: Sales) => {
    toast.show(`Invoice PDF SBP/INV/${s.invoiceNumber} downloaded!`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Sales Billing & Invoicing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate tax invoices, manage print layouts, and record client credit ledger items.
          </p>
        </div>

        <div className="flex border border-slate-205 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900 select-none no-print">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'create' ? 'bg-emerald-600 text-white' : 'text-slate-505 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Plus size={14} /> New Invoice
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-505 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <History size={14} /> Invoice Records
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form container */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-3 mb-5 dark:border-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" /> Sales Billing Calculator
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Customer / Shop *"
                  options={[
                    { value: '', label: 'Select client center...' },
                    ...customers.map(c => ({ value: c.id, label: `${c.shopName} (${c.name})` }))
                  ]}
                  error={errors.customerId?.message}
                  {...register('customerId')}
                />
                <Input
                  label="Billing Date *"
                  type="date"
                  error={errors.date?.message}
                  {...register('date')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Chicken Item Type *"
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
                  placeholder="e.g. 800"
                  error={errors.weight?.message}
                  {...register('weight')}
                />
                <Input
                  label="Selling Rate / KG (INR) *"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 125"
                  error={errors.sellingRate?.message}
                  {...register('sellingRate')}
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Discounts & Overhead Vouchers</p>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Packing Charge"
                    type="number"
                    error={errors.packingCharge?.message}
                    {...register('packingCharge')}
                  />
                  <Input
                    label="Delivery Charge"
                    type="number"
                    error={errors.deliveryCharge?.message}
                    {...register('deliveryCharge')}
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
                  label="Taxes (GST Rate) *"
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
                  label="Payment Book Mode *"
                  options={[
                    { value: 'Credit', label: 'Credit (Pay Later)' },
                    { value: 'Cash', label: 'Cash Payment' },
                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                    { value: 'UPI', label: 'UPI QR Payment' },
                  ]}
                  error={errors.paymentType?.message}
                  {...register('paymentType')}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                <Button size="lg" type="submit" leftIcon={<Check size={18} />}>
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>

          {/* Invoice Layout Screen View (right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
            <div className="flex items-center justify-between no-print bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold px-3 text-slate-500">Invoice Format Preview</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPreviewFormat('A4')}
                  className={`px-3 py-1.5 text-xxs font-bold rounded-lg cursor-pointer transition ${
                    previewFormat === 'A4' ? 'bg-white dark:bg-slate-850 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  Standard A4
                </button>
                <button
                  onClick={() => setPreviewFormat('thermal')}
                  className={`px-3 py-1.5 text-xxs font-bold rounded-lg cursor-pointer transition ${
                    previewFormat === 'thermal' ? 'bg-white dark:bg-slate-850 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  Thermal (Receipt)
                </button>
              </div>
            </div>

            {previewFormat === 'A4' ? (
              /* A4 Visual Card */
              <Card className="bg-white text-slate-950 border border-slate-205 shadow-md p-6 font-sans text-xxs flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                <div className="flex justify-between border-b pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-tight">{settings.companyName}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      {settings.address}<br />
                      GST: {settings.gstNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-extrabold text-slate-800">TAX INVOICE</h4>
                    <p className="mt-1 text-[10px] text-slate-500">
                      INV: <span className="font-semibold text-slate-700">SBP/INV/2026/XXX</span><br />
                      Date: {formatDate(watchedFields.date || '')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Billed To:</p>
                    <p className="font-bold text-slate-805 mt-1">
                      {customers.find(c => c.id === watchedFields.customerId)?.shopName || 'WALK-IN CLIENT'}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Proprietor: {customers.find(c => c.id === watchedFields.customerId)?.name || 'Walk-in'}<br />
                      Address: {customers.find(c => c.id === watchedFields.customerId)?.address || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transport Policy:</p>
                    <p className="text-[9px] text-slate-650 mt-1">
                      Mode: {watchedFields.paymentType || 'Credit'}<br />
                      Packing Charge: {formatCurrency(packingCharge)}<br />
                      Delivery Charge: {formatCurrency(deliveryCharge)}
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse text-left text-[10px] mt-2">
                  <thead>
                    <tr className="bg-emerald-600 text-white font-semibold">
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-right">Weight</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Taxable</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">{watchedFields.chickenType}</td>
                      <td className="p-2 text-right">{formatWeight(weight)}</td>
                      <td className="p-2 text-right">{formatCurrency(sellingRate)}</td>
                      <td className="p-2 text-right">{formatCurrency(subtotal)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between items-start mt-4 gap-6">
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border text-[9px] text-slate-455 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                    <strong>Terms & Conditions:</strong><br />
                    {settings.termsAndConditions}
                  </div>
                  <div className="w-48 text-right font-medium text-[10px] space-y-1.5">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-rose-500"><span>Discount:</span><span>-{formatCurrency(discount)}</span></div>
                    <div className="flex justify-between"><span>GST ({gst}%):</span><span>{formatCurrency(gstAmount)}</span></div>
                    <div className="flex justify-between border-t pt-1.5 font-bold text-emerald-600 text-xs">
                      <span>Total Due:</span><span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              /* Thermal Receipt Visual Card */
              <Card className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-300 border border-slate-205 dark:border-slate-800 p-6 font-mono text-xxs flex flex-col gap-3 max-w-[320px] mx-auto shadow-md">
                <div className="text-center border-b border-dashed border-slate-350 pb-2">
                  <h4 className="font-bold uppercase tracking-tight text-slate-950 dark:text-white">{settings.companyName}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">{settings.phone}</p>
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-2">SALES RECEIPT</p>
                </div>
                
                <div className="space-y-1 text-slate-650">
                  <div className="flex justify-between"><span>Inv:</span><span>SBP/INV/2026/XXX</span></div>
                  <div className="flex justify-between"><span>Date:</span><span>{formatDate(watchedFields.date || '')}</span></div>
                  <div className="flex justify-between"><span>Shop:</span><span className="truncate max-w-[120px]">
                    {customers.find(c => c.id === watchedFields.customerId)?.shopName || 'WALK-IN'}
                  </span></div>
                </div>
                
                <hr className="border-dashed border-slate-350" />
                
                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="font-bold border-b border-dashed border-slate-350 text-slate-950">
                      <th>Desc</th>
                      <th className="text-right">Weight</th>
                      <th className="text-right font-normal">Rate</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">{watchedFields.chickenType}</td>
                      <td className="text-right">{formatWeight(weight)}</td>
                      <td className="text-right">{sellingRate}</td>
                      <td className="text-right">{formatCurrency(subtotal)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <hr className="border-dashed border-slate-350" />
                
                <div className="space-y-1 text-right font-medium text-slate-650">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(discount)}</span></div>
                  <div className="flex justify-between"><span>GST ({gst}%):</span><span>{formatCurrency(gstAmount)}</span></div>
                  <div className="flex justify-between"><span>Charges:</span><span>{formatCurrency(packingCharge + deliveryCharge)}</span></div>
                  <div className="flex justify-between text-slate-950 font-bold border-t border-dashed border-slate-350 pt-1.5">
                    <span>Grand Total:</span><span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Sales history table */
        <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
          <Table
            data={sales}
            searchPlaceholder="Search invoices by invoice number or client..."
            enableSearch={true}
            searchKeys={['invoiceNumber']}
            pageSize={10}
            columns={[
              { header: 'Invoice Number', accessorKey: 'invoiceNumber', sortable: true },
              { header: 'Shop Customer', cell: (row) => customers.find(c => c.id === row.customerId)?.shopName || 'Walk-in' },
              { header: 'Date', accessorKey: 'date', sortable: true, cell: (row) => formatDate(row.date) },
              { header: 'Chicken Item', accessorKey: 'chickenType' },
              { header: 'Weight (KG)', cell: (row) => formatWeight(row.weight) },
              { header: 'Total Paid/Due', cell: (row) => formatCurrency(row.totalAmount) },
              { header: 'Payment Method', accessorKey: 'paymentType' },
              {
                header: 'Invoice Actions',
                cell: (row) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handlePrint(row, 'A4')} className="hover:text-emerald-500">
                      <Printer size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShareWhatsApp(row)} className="hover:text-emerald-555">
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
