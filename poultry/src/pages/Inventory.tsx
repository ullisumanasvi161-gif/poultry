import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Textarea } from '../components/ui/FormElements';
import { Table } from '../components/ui/Table';
import { formatWeight, formatDate } from '../utils/helpers';
import { Skull, CornerDownLeft, Plus, History, Warehouse, AlertTriangle } from 'lucide-react';
import { ChickenType } from '../types';

export const InventoryPage: React.FC = () => {
  const { inventory, addDeadStock, addReturnedStock, marketRates, suppliers } = useApp();
  const [isDeadModalOpen, setIsDeadModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Forms states
  const [deadWeight, setDeadWeight] = useState('');
  const [deadType, setDeadType] = useState<ChickenType>('Broiler (Live)');
  const [deadNotes, setDeadNotes] = useState('');

  const [returnWeight, setReturnWeight] = useState('');
  const [returnType, setReturnType] = useState<ChickenType>('Broiler (Live)');
  const [returnNotes, setReturnNotes] = useState('');

  const handleDeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(deadWeight);
    if (w <= 0) return alert('Weight must be positive');
    addDeadStock(w, deadType, deadNotes);
    setIsDeadModalOpen(false);
    setDeadWeight('');
    setDeadNotes('');
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(returnWeight);
    if (w <= 0) return alert('Weight must be positive');
    addReturnedStock(w, returnType, returnNotes);
    setIsReturnModalOpen(false);
    setReturnWeight('');
    setReturnNotes('');
  };
  const getSupplierNamesText = () => {
    if (suppliers.length === 0) {
      return 'your suppliers';
    } else if (suppliers.length === 1) {
      return suppliers[0].name;
    } else {
      return `${suppliers[0].name} or ${suppliers[1].name}`;
    }
  };
  // Stock items definition
  const stocks = [
    { title: 'Live Bird Stock', value: inventory.liveWeight, color: 'emerald', desc: 'Active stock in cages' },
    { title: 'Processed Stock', value: inventory.processedWeight, color: 'blue', desc: 'Ready cold storage cuts' },
    { title: 'Dead Stock (Loss)', value: inventory.deadWeight, color: 'rose', desc: 'Mortality logs (unusable)' },
    { title: 'Returned Birds', value: inventory.returnedWeight, color: 'amber', desc: 'Customer rejected logs' }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Inventory & Live Stock
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            Monitor real-time bird counts, log bird mortality, and process customer returns.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeadModalOpen(true)}
            leftIcon={<Skull size={14} />}
          >
            Log Dead Stock
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsReturnModalOpen(true)}
            leftIcon={<CornerDownLeft size={14} />}
          >
            Record Returns
          </Button>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stocks.map((s, idx) => (
          <Card key={idx} borderAccent={s.color as any}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{s.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatWeight(s.value)}
            </h3>
            <p className="text-xxs text-slate-400 mt-2">{s.desc}</p>
          </Card>
        ))}
      </div>

      {/* Warning Alert */}
      {inventory.liveWeight < 1500 && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl text-rose-800 dark:text-rose-400">
          <AlertTriangle className="text-rose-500 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-bold leading-none">Critical Stock Deficit</h4>
            <p className="text-xxs text-rose-600/90 dark:text-rose-400 mt-1">
              Live stock is dangerously low. Order from {getSupplierNamesText()} immediately to satisfy pending client orders.
            </p>
          </div>
        </div>
      )}

      {/* Inventory Transaction Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
          <History size={18} className="text-emerald-500" /> Stock Audit Logs
        </h3>
        
        <Table
          data={inventory.history}
          searchPlaceholder="Search audit notes..."
          enableSearch={true}
          searchKeys={['notes', 'chickenType']}
          pageSize={10}
          columns={[
            { header: 'Date', accessorKey: 'date', sortable: true, cell: (row) => formatDate(row.date) },
            { 
              header: 'Operation Type', 
              accessorKey: 'type',
              cell: (row) => (
                <span className={`px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider ${
                  row.type === 'purchase' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-450 border border-emerald-100/30' 
                    : row.type === 'sale'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-450 border border-blue-100/30'
                    : row.type === 'dead'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/25 dark:text-rose-450 border border-rose-100/30'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-450 border border-amber-100/30'
                }`}>
                  {row.type}
                </span>
              )
            },
            { header: 'Breed Item', accessorKey: 'chickenType' },
            { 
              header: 'Weight Adjustment', 
              cell: (row) => (
                <span className={`font-semibold ${
                  row.type === 'purchase' || row.type === 'return' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {row.type === 'purchase' || row.type === 'return' ? '+' : '-'}{formatWeight(row.weight)}
                </span>
              )
            },
            { header: 'Audit Comments / Reference', accessorKey: 'notes' }
          ]}
        />
      </div>

      {/* Log Dead Stock Modal */}
      <Modal
        isOpen={isDeadModalOpen}
        onClose={() => setIsDeadModalOpen(false)}
        title="Log Bird Mortality Loss"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeadModalOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDeadSubmit}>Log Loss</Button>
          </div>
        }
      >
        <form onSubmit={handleDeadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Breed Type *"
              value={deadType}
              onChange={(e) => setDeadType(e.target.value as ChickenType)}
              options={marketRates.map(r => ({ value: r.chickenType, label: r.chickenType }))}
            />
            <Input
              label="Total Dead Weight (KG) *"
              type="number"
              step="0.01"
              value={deadWeight}
              onChange={(e) => setDeadWeight(e.target.value)}
              placeholder="e.g. 25.5"
            />
          </div>
          <Textarea
            label="Reason / Notes *"
            value={deadNotes}
            onChange={(e) => setDeadNotes(e.target.value)}
            placeholder="e.g. High ambient temperature coop 4, transit stress..."
            required={true}
          />
        </form>
      </Modal>

      {/* Log Return Stock Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Record Customer Stock Return"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
            <Button variant="secondary" size="sm" onClick={handleReturnSubmit}>Process Return</Button>
          </div>
        }
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Breed Type *"
              value={returnType}
              onChange={(e) => setReturnType(e.target.value as ChickenType)}
              options={marketRates.map(r => ({ value: r.chickenType, label: r.chickenType }))}
            />
            <Input
              label="Returned Weight (KG) *"
              type="number"
              step="0.01"
              value={returnWeight}
              onChange={(e) => setReturnWeight(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
          <Textarea
            label="Rejection Reason *"
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="e.g. Size rejection from Suresh Chicken Center..."
            required={true}
          />
        </form>
      </Modal>
    </div>
  );
};
