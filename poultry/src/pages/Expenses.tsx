import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/FormElements';
import { Table } from '../components/ui/Table';
import { formatCurrency, formatDate } from '../utils/helpers';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, History, Calculator, Trash2, AlertCircle, FileText, Lightbulb, ClipboardList, Check, X } from 'lucide-react';
import { ExpenseCategory } from '../types';

export const Expenses: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [showDescRequiredPopup, setShowDescRequiredPopup] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  // Calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Grouped amounts for stats
  const getCategoryTotal = (cat: ExpenseCategory) => {
    return expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (amt <= 0) return alert('Amount must be positive');
    if (!description.trim()) {
      setShowDescRequiredPopup(true);
      return;
    }

    addExpense({
      category,
      amount: amt,
      date,
      description,
    });
    setIsModalOpen(false);
    setAmount('');
    setDescription('');
  };

  // Filtered Expense Records
  const filteredExpenses = expenses.filter(e => {
    if (selectedCategoryFilter === 'All') return true;
    return e.category === selectedCategoryFilter;
  });

  // Recharts aggregates
  const chartData = React.useMemo(() => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Expense Manager
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            Log fuel charges, employee payrolls, utilities, and general maintenance costs.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={16} />}
          size="sm"
          className="no-print"
        >
          Record Expense
        </Button>
      </div>

      {/* Summary Aggregate cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card borderAccent="rose">
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mb-1">Total Monthly Expenses</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalExpenses)}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">Aggregated sum of all logs</p>
        </Card>
        
        <Card>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mb-1">Highest Overhead Category</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {expenses.length > 0 
              ? [...chartData].sort((a,b) => b.Amount - a.Amount)[0]?.category + ` (${formatCurrency([...chartData].sort((a,b) => b.Amount - a.Amount)[0]?.Amount)})`
              : 'None'}
          </h3>
          <p className="text-xxs text-slate-400 mt-2">Excluding direct bird purchases</p>
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-2 text-xxs">
            <div>
              <span className="text-slate-450">Fuel:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-350">{formatCurrency(getCategoryTotal('Fuel'))}</p>
            </div>
            <div>
              <span className="text-slate-450">Payroll Salary:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-350">{formatCurrency(getCategoryTotal('Salary'))}</p>
            </div>
            <div>
              <span className="text-slate-450">Electricity:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-350">{formatCurrency(getCategoryTotal('Electricity'))}</p>
            </div>
            <div>
              <span className="text-slate-450">Maintenance:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-350">{formatCurrency(getCategoryTotal('Maintenance'))}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Expenses List Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between no-print border-b pb-3 mb-2 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <History size={18} className="text-emerald-500" /> Overhead Ledger Entries
            </h3>
            
            {/* Category Filter dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xxs text-slate-455">Filter:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xxs border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Categories</option>
                <option value="Fuel">Fuel</option>
                <option value="Transport">Transport</option>
                <option value="Salary">Salary</option>
                <option value="Electricity">Electricity</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          <Table
            data={filteredExpenses}
            searchPlaceholder="Search descriptions..."
            enableSearch={true}
            searchKeys={['description']}
            pageSize={5}
            columns={[
              { header: 'Date', accessorKey: 'date', sortable: true, cell: (row) => formatDate(row.date) },
              { 
                header: 'Category', 
                accessorKey: 'category',
                cell: (row) => (
                  <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/20 px-2.5 py-0.5 rounded-md text-xxs font-bold uppercase">
                    {row.category}
                  </span>
                )
              },
              { header: 'Amount', accessorKey: 'amount', sortable: true, cell: (row) => formatCurrency(row.amount) },
              { header: 'Expense Description', accessorKey: 'description' },
              {
                header: 'Actions',
                cell: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this expense?')) deleteExpense(row.id);
                    }}
                    className="hover:text-rose-500 no-print"
                  >
                    <Trash2 size={14} />
                  </Button>
                )
              }
            ]}
          />
        </div>

        {/* Expenses Recharts Bar Chart (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <Calculator size={18} className="text-emerald-500" /> Category Breakdown Chart
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 9 }} />
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
                <Bar dataKey="Amount" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Expense"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>Log Expense</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Expense Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              options={[
                { value: 'Fuel', label: 'Fuel (Diesel/Petrol)' },
                { value: 'Transport', label: 'Transport / Vehicle Rental' },
                { value: 'Salary', label: 'Employee Salary Payroll' },
                { value: 'Electricity', label: 'Electricity / Cold Storage Bill' },
                { value: 'Maintenance', label: 'Farm / Stall Maintenance' },
                { value: 'Miscellaneous', label: 'Miscellaneous Office Cost' },
              ]}
            />
            <Input
              label="Transaction Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Input
            label="Amount Paid (INR) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 8500"
          />
          <Input
            label="Expense Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Disinfectant spray for coop cages"
            required={true}
          />
        </form>
      </Modal>

      {/* Description Required Warning Modal */}
      <Modal
        isOpen={showDescRequiredPopup}
        onClose={() => setShowDescRequiredPopup(false)}
        size="sm"
        showHeader={false}
      >
        <div className="flex flex-col">
          {/* Yellow Warning Document Icon */}
          <div className="flex justify-center mb-5 mt-2">
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-full flex items-center justify-center border border-amber-100 dark:border-amber-900/30 w-16 h-16 relative">
              <FileText size={32} className="text-amber-500 font-bold" />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <AlertCircle size={10} className="stroke-[3]" />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white text-center">
            Description is required
          </h3>
          
          <div className="flex justify-center items-center my-3">
            <div className="w-12 border-b border-amber-300 dark:border-amber-700/50"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400 mx-1"></div>
            <div className="w-12 border-b border-amber-300 dark:border-amber-700/50"></div>
          </div>

          <p className="text-xs text-slate-550 dark:text-slate-400 text-center mb-6">
            Please enter a description to continue.
          </p>

          {/* Info Card */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-2xl flex items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 p-2 rounded-full flex-shrink-0 mt-0.5">
                <Lightbulb size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-805 dark:text-emerald-450">Why is this needed?</span>
                <span className="text-xxs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Adding a description helps keep your records clear and organised.
                </span>
              </div>
            </div>
            <div className="text-emerald-500/80 dark:text-emerald-450/60 pr-1 flex-shrink-0">
              <ClipboardList size={36} />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowDescRequiredPopup(false)}
              className="border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer transition select-none"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDescRequiredPopup(false)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm justify-center select-none"
            >
              <Check size={14} />
              <span>OK, I'll add it</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
