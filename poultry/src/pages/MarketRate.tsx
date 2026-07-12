import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormElements';
import { formatCurrency } from '../utils/helpers';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Edit2, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { ChickenType } from '../types';

export const MarketRates: React.FC = () => {
  const { marketRates, updateMarketRate, rateHistory } = useApp();
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [editPurchaseVal, setEditPurchaseVal] = useState(0);
  const [editSellingVal, setEditSellingVal] = useState(0);

  const selectedRate = marketRates.find(r => r.id === selectedRateId);

  const startEdit = (id: string, buy: number, sell: number) => {
    setSelectedRateId(id);
    setEditPurchaseVal(buy);
    setEditSellingVal(sell);
  };

  const handleUpdate = () => {
    if (selectedRateId) {
      updateMarketRate(selectedRateId, editPurchaseVal, editSellingVal);
      setSelectedRateId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Market Rates & Pricing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure wholesale trading values and view historic price fluctuations.
          </p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {marketRates.map(rate => (
          <Card key={rate.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">{rate.chickenType}</p>
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Buy Rate:</span>
                <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(rate.purchaseRate)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                <span className="text-slate-500 dark:text-slate-400">Sell Rate:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-450">{formatCurrency(rate.sellingRate)}</span>
              </div>
            </div>
            
            <button
              onClick={() => startEdit(rate.id, rate.purchaseRate, rate.sellingRate)}
              className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-150 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Edit2 size={12} />
            </button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Market Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" /> Market Price Trends (Weekly)
            </h3>
            <span className="text-xxs font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
              Broiler Buying Rate History
            </span>
          </div>
          
          <div className="h-72 w-full text-xs mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="date" stroke="#64748b" />
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
                <Line type="monotone" dataKey="Broiler" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} name="Broiler (Live)" />
                <Line type="monotone" dataKey="Country" stroke="#ec4899" strokeWidth={2} name="Country Chicken" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pricing Adjuster (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-3 mb-5 dark:border-slate-800 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-500" /> Adjust Today's Rates
          </h3>
          
          {selectedRateId ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-xxs text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">Modifying Item</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{selectedRate?.chickenType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Buying Rate (Buy)"
                  type="number"
                  value={editPurchaseVal}
                  onChange={(e) => setEditPurchaseVal(Number(e.target.value))}
                />
                <Input
                  label="Selling Rate (Sell)"
                  type="number"
                  value={editSellingVal}
                  onChange={(e) => setEditSellingVal(Number(e.target.value))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRateId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleUpdate}
                  className="flex-1"
                  leftIcon={<RefreshCw size={14} />}
                >
                  Update Rate
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400">
                Hover over any price card above and click the edit icon to adjust that item's rates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
