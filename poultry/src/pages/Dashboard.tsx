import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Scale, 
  AlertTriangle, 
  Users, 
  Truck, 
  ArrowRight,
  TrendingDown as ExpIcon,
  Receipt,
  FileText,
  Warehouse
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatWidget } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { formatCurrency, formatWeight, formatDate } from '../utils/helpers';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { 
    sales, 
    purchases, 
    customers, 
    suppliers, 
    expenses, 
    inventory, 
    marketRates, 
    salesTrend,
    ledgerEntries 
  } = useApp();

  // 1. Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  
  const todayPurchases = purchases
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const todaySales = sales
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + 
    purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const pendingReceivables = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const pendingPayables = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  const broilerRate = marketRates.find(r => r.chickenType === 'Broiler (Live)')?.sellingRate || 125;
  const broilerBuyRate = marketRates.find(r => r.chickenType === 'Broiler (Live)')?.purchaseRate || 110;

  // Get low stock status
  const isLowStock = inventory.liveWeight < 2000;

  // Combine sales and purchases to form a chronological transaction timeline
  const recentTransactions = [...sales.map(s => ({
    id: s.id,
    date: s.date,
    type: 'Sale',
    party: customers.find(c => c.id === s.customerId)?.shopName || 'Unknown',
    amount: s.totalAmount,
    method: s.paymentType,
    details: `${formatWeight(s.weight)} of ${s.chickenType}`,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
  })), ...purchases.map(p => ({
    id: p.id,
    date: p.date,
    type: 'Purchase',
    party: suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown',
    amount: p.totalAmount,
    method: p.paymentMethod,
    details: `${formatWeight(p.weight)} of ${p.chickenType}`,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
  }))]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5);

  // Expense categories aggregate data for Recharts Bar Chart
  const expenseChartData = React.useMemo(() => {
    const map: Record<string, number> = {
      Fuel: 0,
      Transport: 0,
      Salary: 0,
      Electricity: 0,
      Maintenance: 0,
      Miscellaneous: 0,
    };
    expenses.forEach(e => {
      if (map[e.category] !== undefined) {
        map[e.category] += e.amount;
      }
    });
    return Object.keys(map).map(cat => ({
      category: cat,
      Amount: map[cat],
    }));
  }, [expenses]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Poultry Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time poultry billing, inventory controls, and financial ledgers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sales">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition duration-150 flex items-center gap-2 cursor-pointer">
              <FileText size={16} /> Generate Invoice
            </button>
          </Link>
          <Link to="/purchases">
            <button className="border border-slate-350 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer">
              <Receipt size={16} /> New Purchase
            </button>
          </Link>
        </div>
      </div>

      {/* Critical Alert Banners */}
      {isLowStock && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/30 p-4 rounded-2xl text-amber-800 dark:text-amber-300">
          <AlertTriangle className="flex-shrink-0 text-amber-500 animate-pulse" size={22} />
          <div className="flex-1">
            <h4 className="text-sm font-bold leading-none">Low Poultry Stock Alert</h4>
            <p className="text-xs text-amber-600/90 dark:text-amber-400 mt-1">
              Live stock is currently at <span className="font-extrabold">{formatWeight(inventory.liveWeight)}</span>. Standard warehouse operations require a safety buffer of at least 2,000 KG.
            </p>
          </div>
          <Link to="/purchases" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1">
            Reorder Stock <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatWidget 
          title="Today's Sales" 
          value={formatCurrency(todaySales)} 
          icon={<TrendingUp size={22} />} 
          color="emerald"
          subtext="Net sales recorded today"
        />
        <StatWidget 
          title="Today's Purchases" 
          value={formatCurrency(todayPurchases)} 
          icon={<TrendingDown size={22} />} 
          color="amber"
          subtext="Net purchases recorded today"
        />
        <StatWidget 
          title="Customer Receivables" 
          value={formatCurrency(pendingReceivables)} 
          icon={<Users size={22} />} 
          color="blue"
          subtext="Pending collection book"
        />
        <StatWidget 
          title="Supplier Payables" 
          value={formatCurrency(pendingPayables)} 
          icon={<Truck size={22} />} 
          color="rose"
          subtext="Pending payment balance"
        />
        <StatWidget 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          icon={<DollarSign size={22} />} 
          color="emerald"
          subtext="Cumulative invoice sum"
        />
        <StatWidget 
          title="Net Profit / Loss" 
          value={formatCurrency(netProfit)} 
          icon={<Scale size={22} />} 
          color={netProfit >= 0 ? "emerald" : "rose"}
          subtext="Revenue minus cost book"
        />
        <StatWidget 
          title="Live Stock Weight" 
          value={formatWeight(inventory.liveWeight)} 
          icon={<Warehouse size={22} />} 
          color="purple"
          subtext="Active birds weight in farm"
        />
        <StatWidget 
          title="Market Broiler Rate" 
          value={`${formatCurrency(broilerRate)} / KG`} 
          icon={<TrendingUp size={22} />} 
          color="amber"
          subtext={`Buying: ${formatCurrency(broilerBuyRate)}/KG`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Vs Purchases Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sales & Purchases Trend (7 Days)</h3>
            <span className="text-xxs font-semibold bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">Weekly Ledger Flow</span>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#64748b" />
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
                <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Purchases" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Expense Distribution</h3>
            <span className="text-xxs font-semibold bg-rose-500/10 text-rose-600 px-2.5 py-1 rounded-full">Farm Overheads</span>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="category" stroke="#64748b" />
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
                <Bar dataKey="Amount" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Recent Postings & Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <Link to="/ledgers" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              View All Ledgers
            </Link>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {recentTransactions.map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1.5 rounded-lg border text-xxs font-bold uppercase tracking-wider ${t.color}`}>
                    {t.type}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{t.party}</p>
                    <p className="text-xxs text-slate-400 mt-1">{t.details} • {t.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(t.amount)}</p>
                  <p className="text-xxs text-slate-450 mt-1">{formatDate(t.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top Sales Customers</h3>
            <div className="mt-3.5 space-y-3">
              {customers.slice(0, 3).map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">#{i+1}</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{c.shopName}</p>
                      <p className="text-xxs text-slate-400">{c.name}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {formatCurrency(c.outstandingBalance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <hr className="border-slate-100 dark:border-slate-850" />

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top Suppliers</h3>
            <div className="mt-3.5 space-y-3">
              {suppliers.slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">#{i+1}</span>
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[140px]">{s.name}</span>
                  </div>
                  <span className="font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {formatCurrency(s.outstandingBalance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
