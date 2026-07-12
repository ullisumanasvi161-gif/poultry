import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Textarea } from '../components/ui/FormElements';
import { Table } from '../components/ui/Table';
import { formatCurrency, formatDate } from '../utils/helpers';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus, History, X, Wallet, Lightbulb, Check } from 'lucide-react';

export const Payments: React.FC = () => {
  const { customers, suppliers, payments, addPayment } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'customer' | 'supplier'>('customer');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupOutstanding, setErrorPopupOutstanding] = useState(0);

  // Form State
  const [partyId, setPartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'UPI'>('UPI');
  const [notes, setNotes] = useState('');

  const selectedPartyOutstanding = partyId
    ? (paymentType === 'customer'
        ? customers.find(c => c.id === partyId)?.outstandingBalance || 0
        : suppliers.find(s => s.id === partyId)?.outstandingBalance || 0)
    : 0;

  const isDueZero = Boolean(partyId && selectedPartyOutstanding <= 0);

  // Calculations
  const customerReceivables = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const supplierPayables = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);
  
  const totalReceived = payments
    .filter(p => p.partyType === 'customer')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const totalPaid = payments
    .filter(p => p.partyType === 'supplier')
    .reduce((sum, p) => sum + p.amount, 0);

  const openPaymentModal = (type: 'customer' | 'supplier') => {
    setPaymentType(type);
    setPartyId('');
    setAmount('');
    setNotes('');
    setDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!partyId) return alert('Please select a party');
    
    if (selectedPartyOutstanding <= 0) {
      alert('Cannot record payment for an account with zero outstanding due.');
      return;
    }

    if (amt <= 0) return alert('Amount must be positive');
    
    if (amt > selectedPartyOutstanding) {
      setErrorPopupOutstanding(selectedPartyOutstanding);
      setShowErrorPopup(true);
      return;
    }

    addPayment({
      partyId,
      partyType: paymentType,
      amount: amt,
      date,
      paymentMethod: method,
      notes,
    });
    setIsModalOpen(false);
  };

  const paymentsWithPartyNames = React.useMemo(() => {
    return payments.map(p => {
      let partyName = '';
      if (p.partyType === 'customer') {
        const cust = customers.find(c => c.id === p.partyId);
        partyName = cust ? `${cust.shopName} (${cust.name})` : 'Unknown Customer';
      } else {
        const sup = suppliers.find(s => s.id === p.partyId);
        partyName = sup ? sup.name : 'Unknown Supplier';
      }
      return {
        ...p,
        partyName
      };
    });
  }, [payments, customers, suppliers]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Payment Register Vouchers
          </h1>
          <p className="text-sm text-slate-555 dark:text-slate-400 mt-1">
            Log cash and online payments, offset invoices, and track overall outstanding accounts.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openPaymentModal('customer')}
            leftIcon={<ArrowDownLeft size={16} />}
          >
            Collect Payment (Customer)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openPaymentModal('supplier')}
            leftIcon={<ArrowUpRight size={16} />}
          >
            Pay Supplier Voucher
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card borderAccent="emerald">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Pending Receivables</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(customerReceivables)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">Sum of customer outstanding balances</p>
        </Card>
        <Card borderAccent="rose">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Pending Payables</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(supplierPayables)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">Sum of supplier unpaid balances</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Collections</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalReceived)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">Cumulative cash inflows logged</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Paid Out</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalPaid)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">Cumulative cash outflows logged</p>
        </Card>
      </div>

      {/* Payment Vouchers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-2">
          <History size={18} className="text-emerald-500" /> Recent Vouchers Log
        </h3>

        <Table
          data={paymentsWithPartyNames}
          searchPlaceholder="Search by party name..."
          enableSearch={true}
          searchKeys={['partyName', 'paymentMethod']}
          pageSize={10}
          columns={[
            { header: 'Date', accessorKey: 'date', sortable: true, cell: (row) => formatDate(row.date) },
            {
              header: 'Voucher Type',
              cell: (row) => (
                <span className={`px-2.5 py-0.5 rounded-md text-xxs font-bold uppercase tracking-wider ${
                  row.partyType === 'customer' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                }`}>
                  {row.partyType === 'customer' ? 'Receipt (In)' : 'Payment (Out)'}
                </span>
              ),
            },
            {
              header: 'Party Account',
              accessorKey: 'partyName',
              sortable: true,
            },
            {
              header: 'Paid Amount',
              accessorKey: 'amount',
              sortable: true,
              cell: (row) => (
                <span className={`font-semibold ${row.partyType === 'customer' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {formatCurrency(row.amount)}
                </span>
              ),
            },
            { header: 'Payment Method', accessorKey: 'paymentMethod' },
            { header: 'Voucher Notes', accessorKey: 'notes' },
          ]}
        />
      </div>

      {/* Payment entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={paymentType === 'customer' ? 'Record Customer Receipt Voucher' : 'Record Supplier Payment Voucher'}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={isDueZero}>Save Voucher</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label={paymentType === 'customer' ? 'Select Customer *' : 'Select Supplier *'}
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                options={[
                  { value: '', label: 'Select a party...' },
                  ...(paymentType === 'customer'
                    ? customers.map(c => ({ value: c.id, label: `${c.shopName} (${c.name})` }))
                    : suppliers.map(s => ({ value: s.id, label: s.name })))
                ]}
              />
              {partyId && (
                <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold">Current Due Amount:</span>
                  <span className={`font-bold ${paymentType === 'customer' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {formatCurrency(selectedPartyOutstanding)}
                  </span>
                </div>
              )}
            </div>
            <Input
              label="Transaction Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {isDueZero && (
            <div className="text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20 px-3 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
              This account has no outstanding due balance. You cannot record further payment vouchers.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount Paid (INR) *"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
              disabled={isDueZero}
            />
            <Select
              label="Payment Method *"
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              options={[
                { value: 'UPI', label: 'UPI / QR Code Scan' },
                { value: 'Bank Transfer', label: 'NEFT / IMPS Bank Transfer' },
                { value: 'Cash', label: 'Cash Payment' },
              ]}
            />
          </div>
          <Textarea
            label="Memo Remarks"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Invoice clearing notes, reference cheque numbers..."
          />
        </form>
      </Modal>

      {/* Error Warning Modal */}
      <Modal
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        size="sm"
        showHeader={false}
      >
        <div className="flex flex-col">
          {/* Red Cross Circle */}
          <div className="flex justify-center mb-5 mt-2">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full flex items-center justify-center border border-red-100 dark:border-red-900/30 w-16 h-16">
              <X size={32} className="text-red-500 font-extrabold" />
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white text-center">
            Payment Failed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1.5 mb-6">
            You cannot pay more than the outstanding due amount.
          </p>

          {/* Outstanding Due Amount Card */}
          <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 p-4 rounded-2xl flex items-center gap-3.5 mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-500 p-2.5 rounded-xl flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outstanding Due Amount</span>
              <span className="text-lg font-extrabold text-red-500 mt-0.5">{formatCurrency(errorPopupOutstanding)}</span>
            </div>
          </div>

          {/* Footer controls */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5 max-w-[240px]">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 p-2 rounded-full mt-0.5 flex-shrink-0">
                <Lightbulb size={16} />
              </div>
              <p className="text-[10px] leading-normal text-slate-400 dark:text-slate-500 font-medium">
                Please enter an amount less than or equal to the outstanding due amount.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowErrorPopup(false)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm justify-center select-none"
            >
              <span>Got it!</span>
              <Check size={14} className="bg-white/20 p-0.5 rounded-full" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
