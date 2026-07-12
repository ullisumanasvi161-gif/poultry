import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormElements';
import { formatCurrency, formatWeight, exportToCSV } from '../utils/helpers';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Download, Calendar, DollarSign, PieChart as PieIcon, TrendingUp, FileText } from 'lucide-react';

export const Reports: React.FC = () => {
  const { sales, purchases, expenses, inventory, marketRates } = useApp();
  const [activeReportTab, setActiveReportTab] = useState<'pl' | 'sales' | 'purchases' | 'inventory'>('pl');
  
  // Date range picker states (mocked)
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');

  // 1. Profit & Loss calculations
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPurchasesCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalOperationalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEarnings = totalSalesRevenue - totalPurchasesCost - totalOperationalExpenses;
  const marginPercentage = totalSalesRevenue > 0 ? ((netEarnings / totalSalesRevenue) * 100).toFixed(1) : '0';

  // 2. Sales Breed Breakdown for Pie Chart
  const breedSalesData = React.useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => {
      map[s.chickenType] = (map[s.chickenType] || 0) + s.totalAmount;
    });
    return Object.keys(map).map(breed => ({
      name: breed,
      value: map[breed]
    }));
  }, [sales]);

  const COLORS = ['#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  // P&L Trend (weekly mock)
  const plTrendData = [
    { week: 'Wk 1', Revenue: totalSalesRevenue * 0.25, Cost: totalPurchasesCost * 0.22, Profit: (totalSalesRevenue * 0.25) - (totalPurchasesCost * 0.22) },
    { week: 'Wk 2', Revenue: totalSalesRevenue * 0.35, Cost: totalPurchasesCost * 0.32, Profit: (totalSalesRevenue * 0.35) - (totalPurchasesCost * 0.32) },
    { week: 'Wk 3', Revenue: totalSalesRevenue * 0.20, Cost: totalPurchasesCost * 0.25, Profit: (totalSalesRevenue * 0.20) - (totalPurchasesCost * 0.25) },
    { week: 'Wk 4', Revenue: totalSalesRevenue * 0.20, Cost: totalPurchasesCost * 0.21, Profit: (totalSalesRevenue * 0.20) - (totalPurchasesCost * 0.21) },
  ];

  // Export handlers
  const handleCSVExport = () => {
    let exportData: any[] = [];
    if (activeReportTab === 'pl') {
      exportData = [
        { Metric: 'Sales Revenue', Amount: totalSalesRevenue },
        { Metric: 'Cost of Poultry Purchases', Amount: totalPurchasesCost },
        { Metric: 'Operating Overhead Expenses', Amount: totalOperationalExpenses },
        { Metric: 'Net Profit Earnings', Amount: netEarnings },
        { Metric: 'Profit Margin Percentage', Amount: `${marginPercentage}%` }
      ];
    } else if (activeReportTab === 'sales') {
      exportData = sales.map(s => ({
        InvoiceNo: s.invoiceNumber,
        Date: s.date,
        Breed: s.chickenType,
        WeightKG: s.weight,
        Amount: s.totalAmount,
        Method: s.paymentType
      }));
    } else if (activeReportTab === 'purchases') {
      exportData = purchases.map(p => ({
        ReceiptNo: p.purchaseNumber,
        Date: p.date,
        Breed: p.chickenType,
        WeightKG: p.weight,
        Amount: p.totalAmount,
        Method: p.paymentMethod
      }));
    } else {
      exportData = [
        { StockItem: 'Live Stock Weight', Value: inventory.liveWeight },
        { StockItem: 'Processed Cut Stock', Value: inventory.processedWeight },
        { StockItem: 'Mortality Dead Stock', Value: inventory.deadWeight },
        { StockItem: 'Returned Rejections', Value: inventory.returnedWeight }
      ];
    }

    exportToCSV(exportData, `${activeReportTab}_report`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Reports & Business Intelligence
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            Review detailed Profit & Loss sheets, sales volumes, breed distributions, and audit schedules.
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="flex flex-col sm:flex-row items-end gap-4 bg-white dark:bg-slate-900 border border-slate-202/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs no-print">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Financial Year"
            options={[
              { value: '26-27', label: 'F.Y. 2026 - 27' },
              { value: '25-26', label: 'F.Y. 2025 - 26' },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCSVExport}
            leftIcon={<Download size={14} />}
          >
            Export Sheet
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<FileText size={14} />}
          >
            Download PDF
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-202/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-850 px-6 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveReportTab('pl')}
            className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
              activeReportTab === 'pl' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-505 hover:text-slate-800'
            }`}
          >
            Profit & Loss Summary
          </button>
          <button
            onClick={() => setActiveReportTab('sales')}
            className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
              activeReportTab === 'sales' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-505 hover:text-slate-800'
            }`}
          >
            Sales Turnover
          </button>
          <button
            onClick={() => setActiveReportTab('purchases')}
            className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
              activeReportTab === 'purchases' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-505 hover:text-slate-800'
            }`}
          >
            Purchase Overheads
          </button>
          <button
            onClick={() => setActiveReportTab('inventory')}
            className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
              activeReportTab === 'inventory' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-505 hover:text-slate-800'
            }`}
          >
            Inventory Turnover
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Profit & Loss Report */}
          {activeReportTab === 'pl' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calculations list */}
              <div className="lg:col-span-1 space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                  Income Statement
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Sales Invoices:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(totalSalesRevenue)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b pb-2 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Less: Bird Cost of Purchases:</span>
                  <span className="font-semibold text-rose-500">-{formatCurrency(totalPurchasesCost)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-705 dark:text-slate-350">Gross Trading Profit:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalSalesRevenue - totalPurchasesCost)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b pb-2 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Less: Operating Expenses:</span>
                  <span className="font-semibold text-rose-500">-{formatCurrency(totalOperationalExpenses)}</span>
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-950/15 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/35 flex justify-between items-center mt-4">
                  <div>
                    <p className="text-xxs text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">Net Income Earnings</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 font-bold">Margin: {marginPercentage}%</p>
                  </div>
                  <span className={`text-xl font-bold ${netEarnings >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-500'}`}>
                    {formatCurrency(netEarnings)}
                  </span>
                </div>
              </div>

              {/* Profit & Loss weekly bar chart */}
              <div className="lg:col-span-2 bg-slate-50/30 dark:bg-slate-950/20 p-4 rounded-xl border dark:border-slate-800 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <BarChart3 size={16} className="text-emerald-500" /> Weekly Income vs Cost Trend
                </h4>
                <div className="h-60 w-full text-xxs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="week" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                        formatter={(val: any) => formatCurrency(Number(val))}
                      />
                      <Legend />
                      <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Sales Report */}
          {activeReportTab === 'sales' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                  Sales Analysis
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Weight Sold:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatWeight(sales.reduce((sum, s) => sum + s.weight, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Invoice Count:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{sales.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b pb-2 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Avg Invoice Amount:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(totalSalesRevenue / (sales.length || 1))}
                  </span>
                </div>
              </div>

              {/* Pie Chart Breed distribution */}
              <div className="lg:col-span-2 bg-slate-50/30 dark:bg-slate-950/20 p-4 rounded-xl border dark:border-slate-800 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <PieIcon size={16} className="text-emerald-500" /> Breed Sales Revenue Share
                </h4>
                <div className="h-60 w-full text-xxs flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breedSalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {breedSalesData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Purchases Report */}
          {activeReportTab === 'purchases' && (
            <div className="space-y-4 max-w-md text-sm">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                Purchases Summary
              </h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Poultry Weight Bought:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatWeight(purchases.reduce((sum, p) => sum + p.weight, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Purchase Vouchers:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{purchases.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b pb-2 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Total Spent Value:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(totalPurchasesCost)}</span>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {activeReportTab === 'inventory' && (
            <div className="space-y-4 max-w-md text-sm">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                Inventory Stock Status
              </h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Live Weight:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatWeight(inventory.liveWeight)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Cold Processed cuts:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatWeight(inventory.processedWeight)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Mortality Dead stock weight:</span>
                <span className="font-semibold text-rose-500">{formatWeight(inventory.deadWeight)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b pb-2 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Returned stock weight:</span>
                <span className="font-semibold text-amber-500">{formatWeight(inventory.returnedWeight)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
