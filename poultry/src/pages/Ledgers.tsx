import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/FormElements';
import { Table } from '../components/ui/Table';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import { BookOpen, Printer, Download, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const Ledgers: React.FC = () => {
  const { customers, suppliers, ledgerEntries, settings, toast } = useApp();
  const [partyType, setPartyType] = useState<'customer' | 'supplier'>('customer');
  const [selectedPartyId, setSelectedPartyId] = useState('');

  // Dropdown list based on selection
  const partyList = partyType === 'customer' 
    ? customers.map(c => ({ value: c.id, label: c.shopName }))
    : suppliers.map(s => ({ value: s.id, label: s.name }));

  // Ledger entries filtered by selected party
  const partyLedger = ledgerEntries
    .filter(l => l.partyId === selectedPartyId && l.partyType === partyType)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Totals calculations
  const totalDebit = partyLedger
    .filter(l => l.type === 'debit')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalCredit = partyLedger
    .filter(l => l.type === 'credit')
    .reduce((sum, l) => sum + l.amount, 0);

  const selectedPartyName = partyType === 'customer'
    ? customers.find(c => c.id === selectedPartyId)?.shopName || ''
    : suppliers.find(s => s.id === selectedPartyId)?.name || '';

  const currentOutstanding = partyType === 'customer'
    ? customers.find(c => c.id === selectedPartyId)?.outstandingBalance || 0
    : suppliers.find(s => s.id === selectedPartyId)?.outstandingBalance || 0;

  const handlePrintLedger = () => {
    const printContainer = document.getElementById('print-frame-container');
    if (!printContainer || !selectedPartyId) return;

    let rowsHTML = '';
    partyLedger.forEach(l => {
      rowsHTML += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">${formatDate(l.date)}</td>
          <td style="padding: 10px;">${l.description}</td>
          <td style="padding: 10px; text-align: right; color: ${l.type === 'debit' ? '#dc2626' : '#000'}">${l.type === 'debit' ? formatCurrency(l.amount) : '-'}</td>
          <td style="padding: 10px; text-align: right; color: ${l.type === 'credit' ? '#059669' : '#000'}">${l.type === 'credit' ? formatCurrency(l.amount) : '-'}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${formatCurrency(l.balance)}</td>
        </tr>
      `;
    });

    printContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #000; line-height: 1.5;">
        <center>
          <h2 style="margin: 0; text-transform: uppercase;">${settings.companyName}</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
            ${settings.address}<br>Phone: ${settings.phone}
          </p>
          <hr style="border-top: 2px solid #000; margin: 15px 0;">
          <h3 style="margin: 5px 0;">ACCOUNT STATEMENT (LEDGER)</h3>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Party:</strong> ${selectedPartyName} (${partyType.toUpperCase()})</p>
        </center>

        <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 11px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px;">Date</th>
              <th style="padding: 10px;">Transaction Details</th>
              <th style="padding: 10px; text-align: right;">Debit (Dr)</th>
              <th style="padding: 10px; text-align: right;">Credit (Cr)</th>
              <th style="padding: 10px; text-align: right;">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <hr style="border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <table style="width: 100%; font-size: 12px; font-weight: bold;">
          <tr>
            <td>Total Debit: ${formatCurrency(totalDebit)}</td>
            <td>Total Credit: ${formatCurrency(totalCredit)}</td>
            <td style="text-align: right; color: #059669;">Current Outstanding: ${formatCurrency(currentOutstanding)}</td>
          </tr>
        </table>
      </div>
    `;

    window.print();
  };

  const handleExportCSV = () => {
    if (!selectedPartyId) return;
    const readableData = partyLedger.map(l => ({
      Date: l.date,
      Description: l.description,
      Debit: l.type === 'debit' ? l.amount : 0,
      Credit: l.type === 'credit' ? l.amount : 0,
      Balance: l.balance,
    }));
    exportToCSV(readableData, `${selectedPartyName}_ledger`);
    toast.show('Ledger exported successfully!', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Account Ledgers
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            Display running accounts, audit payments, and print customer/supplier statements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Selection panel (1/4 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-slate-800">
            <BookOpen size={18} className="text-emerald-500" /> Filter Statement
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-350">Party Type</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 dark:bg-slate-950/20 border rounded-xl dark:border-slate-800">
              <button
                onClick={() => {
                  setPartyType('customer');
                  setSelectedPartyId('');
                }}
                className={`py-2 text-xxs font-bold rounded-lg cursor-pointer transition ${
                  partyType === 'customer' 
                    ? 'bg-white dark:bg-slate-850 shadow-xs text-emerald-600 dark:text-emerald-450' 
                    : 'text-slate-500'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  setPartyType('supplier');
                  setSelectedPartyId('');
                }}
                className={`py-2 text-xxs font-bold rounded-lg cursor-pointer transition ${
                  partyType === 'supplier' 
                    ? 'bg-white dark:bg-slate-850 shadow-xs text-emerald-600 dark:text-emerald-450' 
                    : 'text-slate-505'
                }`}
              >
                Supplier
              </button>
            </div>
          </div>

          <Select
            label="Select Account"
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            options={[
              { value: '', label: 'Select a party...' },
              ...partyList
            ]}
          />

          {selectedPartyId && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2 no-print">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={handlePrintLedger}
                leftIcon={<Printer size={14} />}
              >
                Print Statement
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={handleExportCSV}
                leftIcon={<Download size={14} />}
              >
                Export CSV Sheet
              </Button>
            </div>
          )}
        </div>

        {/* Ledger Statement view (3/4 width) */}
        <div className="lg:col-span-3">
          {selectedPartyId ? (
            <div className="flex flex-col gap-6">
              {/* Stats Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Card borderAccent="rose">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Debits (+)</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalDebit)}</h3>
                </Card>
                <Card borderAccent="emerald">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Credits (-)</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalCredit)}</h3>
                </Card>
                <Card borderAccent="amber">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Current Outstanding</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(currentOutstanding)}</h3>
                </Card>
              </div>

              {/* Transactions list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs">
                <Table
                  data={partyLedger}
                  searchPlaceholder="Search transactions..."
                  enableSearch={true}
                  searchKeys={['description']}
                  pageSize={10}
                  columns={[
                    { header: 'Date', accessorKey: 'date', cell: (r) => formatDate(r.date) },
                    { header: 'Description Remarks', accessorKey: 'description' },
                    { 
                      header: 'Debit (Dr)', 
                      cell: (r) => r.type === 'debit' ? (
                        <span className="text-rose-500 font-semibold">{formatCurrency(r.amount)}</span>
                      ) : '-' 
                    },
                    { 
                      header: 'Credit (Cr)', 
                      cell: (r) => r.type === 'credit' ? (
                        <span className="text-emerald-500 font-semibold">{formatCurrency(r.amount)}</span>
                      ) : '-' 
                    },
                    { 
                      header: 'Running Balance', 
                      cell: (r) => (
                        <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(r.balance)}</span>
                      ) 
                    }
                  ]}
                />
              </div>
            </div>
          ) : (
            <Card className="text-center py-20 text-slate-400">
              <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
              <p className="text-sm font-semibold">Generate Account Ledger Statement</p>
              <p className="text-xs mt-1">Select a customer or supplier in the filter panel to view their complete debit/credit transaction book.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
