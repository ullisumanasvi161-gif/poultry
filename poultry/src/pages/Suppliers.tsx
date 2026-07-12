import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Textarea } from '../components/ui/FormElements';
import { formatCurrency, formatWeight, formatDate } from '../utils/helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Phone, MapPin, FileText, ArrowLeft, BookOpen, AlertTriangle } from 'lucide-react';
import { Supplier } from '../types';

const supplierSchema = z.object({
  name: z.string().min(3, 'Supplier name is required (min 3 chars)'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (e.g. 36AAAAA1111A1Z1)').or(z.literal('')),
  openingBalance: z.coerce.number().min(0, 'Opening balance must be 0 or more'),
  creditLimit: z.coerce.number().min(0, 'Credit limit must be 0 or more'),
  notes: z.string().optional(),
});

type SupplierFormInput = z.infer<typeof supplierSchema>;

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, editSupplier, deleteSupplier, purchases, ledgerEntries } = useApp();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'purchases' | 'ledger'>('info');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      gstNumber: '',
      openingBalance: 0,
      creditLimit: 200000,
      notes: '',
    }
  });

  const onSubmit = (data: any) => {
    if (editingSupplier) {
      editSupplier({
        ...editingSupplier,
        ...data,
      });
    } else {
      addSupplier(data);
    }
    closeFormModal();
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    reset({
      name: '',
      phone: '',
      address: '',
      gstNumber: '',
      openingBalance: 0,
      creditLimit: 300000,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSupplier(sup);
    reset({
      name: sup.name,
      phone: sup.phone,
      address: sup.address,
      gstNumber: sup.gstNumber,
      openingBalance: sup.openingBalance,
      creditLimit: sup.creditLimit,
      notes: sup.notes || '',
    });
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
      if (selectedSupplierId === id) setSelectedSupplierId(null);
    }
  };

  // Table Columns
  const columns = [
    {
      header: 'Supplier Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row: Supplier) => (
        <div>
          <p className="font-bold text-slate-805 dark:text-white leading-tight">{row.name}</p>
          {row.gstNumber && (
            <p className="text-xxs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md inline-block mt-1 font-semibold">
              GST: {row.gstNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessorKey: 'phone',
    },
    {
      header: 'Credit Limit',
      accessorKey: 'creditLimit',
      sortable: true,
      cell: (row: Supplier) => formatCurrency(row.creditLimit),
    },
    {
      header: 'Outstanding Balance',
      accessorKey: 'outstandingBalance',
      sortable: true,
      cell: (row: Supplier) => (
        <span className={`font-semibold ${row.outstandingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
          {formatCurrency(row.outstandingBalance)}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row: Supplier) => (
        <div className="flex items-center gap-1.5 no-print">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => openEditModal(row, e)}
            className="hover:text-amber-500 dark:hover:text-amber-400"
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDelete(row.id, e)}
            className="hover:text-rose-500"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  // Specific supplier purchase records
  const supplierPurchases = purchases.filter(p => p.supplierId === selectedSupplierId);

  // Specific supplier ledger history
  const supplierLedger = ledgerEntries
    .filter(l => l.partyId === selectedSupplierId && l.partyType === 'supplier')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Render Section
  if (selectedSupplier) {
    // Credit usage percentage
    const creditUsagePct = Math.min(100, Math.round((selectedSupplier.outstandingBalance / selectedSupplier.creditLimit) * 100)) || 0;
    
    return (
      <div className="flex flex-col gap-6">
        {/* Detail Header / Nav Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSupplierId(null)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 text-slate-500 dark:text-slate-200 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white margin-0">
                {selectedSupplier.name}
              </h1>
              <p className="text-xxs text-slate-400 mt-0.5">Supplier Profile & Statement</p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button variant="outline" size="sm" onClick={(e) => openEditModal(selectedSupplier, e)} leftIcon={<Edit2 size={14} />}>
              Edit Supplier
            </Button>
          </div>
        </div>

        {/* Supplier Analytics Widget Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card borderAccent="amber">
            <p className="text-xs text-slate-500 dark:text-slate-455 font-medium mb-1">Outstanding Balance</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(selectedSupplier.outstandingBalance)}
            </h3>
            {selectedSupplier.outstandingBalance > selectedSupplier.creditLimit * 0.9 && (
              <p className="text-xxs text-rose-500 font-semibold mt-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Balance exceeds safe credit ratio
              </p>
            )}
          </Card>
          <Card borderAccent="emerald">
            <p className="text-xs text-slate-500 dark:text-slate-455 font-medium mb-1">Total Purchased Value</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0))}
            </h3>
            <p className="text-xxs text-slate-400 mt-2">Over {supplierPurchases.length} total receipts</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-455 mb-1 font-medium">
              <span>Credit Utilization</span>
              <span>{formatCurrency(selectedSupplier.creditLimit)} limit</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{creditUsagePct}%</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  creditUsagePct > 90 ? 'bg-rose-500' : creditUsagePct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${creditUsagePct}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Tabbed view for detailed reports */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
          {/* Subtab selection headers */}
          <div className="flex border-b border-slate-100 dark:border-slate-850 px-6 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveSubTab('info')}
              className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
                activeSubTab === 'info' 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Contact Profile Info
            </button>
            <button
              onClick={() => setActiveSubTab('purchases')}
              className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
                activeSubTab === 'purchases' 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Purchase Receipts History ({supplierPurchases.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
                activeSubTab === 'ledger' 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Ledger Statements ({supplierLedger.length})
            </button>
          </div>

          <div className="p-6">
            {/* Info Tab */}
            {activeSubTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4.5">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                    Contact Details
                  </h4>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-slate-400" />
                    <span>{selectedSupplier.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{selectedSupplier.address}</span>
                  </div>
                </div>
                <div className="space-y-4.5">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                    Financial Policy
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">GST Registration</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                        {selectedSupplier.gstNumber || 'Not Registered'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Opening Balance</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                        {formatCurrency(selectedSupplier.openingBalance)}
                      </p>
                    </div>
                  </div>
                  {selectedSupplier.notes && (
                    <div className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-850 mt-4">
                      <p className="text-xxs text-slate-400">Supplier Notes</p>
                      <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 leading-relaxed">
                        {selectedSupplier.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchases Tab */}
            {activeSubTab === 'purchases' && (
              <Table 
                data={supplierPurchases} 
                pageSize={5}
                columns={[
                  { header: 'Receipt No', accessorKey: 'purchaseNumber', sortable: true },
                  { header: 'Date', accessorKey: 'date', sortable: true, cell: (r) => formatDate(r.date) },
                  { header: 'Chicken Type', accessorKey: 'chickenType' },
                  { header: 'Weight', cell: (r) => formatWeight(r.weight) },
                  { header: 'Total Value', cell: (r) => formatCurrency(r.totalAmount) },
                  { header: 'Method', accessorKey: 'paymentMethod' }
                ]}
              />
            )}

            {/* Ledger Tab */}
            {activeSubTab === 'ledger' && (
              <Table 
                data={supplierLedger}
                pageSize={5}
                columns={[
                  { header: 'Date', accessorKey: 'date', cell: (r) => formatDate(r.date) },
                  { header: 'Description', accessorKey: 'description' },
                  { 
                    header: 'Debit (Paid)', 
                    cell: (r) => r.type === 'debit' ? (
                      <span className="text-rose-500 font-semibold">{formatCurrency(r.amount)}</span>
                    ) : '-' 
                  },
                  { 
                    header: 'Credit (Buy)', 
                    cell: (r) => r.type === 'credit' ? (
                      <span className="text-emerald-500 font-semibold">{formatCurrency(r.amount)}</span>
                    ) : '-' 
                  },
                  { header: 'Running Balance', cell: (r) => formatCurrency(r.balance) }
                ]}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white margin-0">
            Supplier Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain wholesale supplier profiles, credit limits, and historical ledgers.
          </p>
        </div>
        <Button onClick={openAddModal} leftIcon={<Plus size={16} />} size="sm">
          Add Supplier
        </Button>
      </div>

      {/* Supplier List Table */}
      <Table
        data={suppliers}
        columns={columns}
        searchPlaceholder="Search suppliers by name or phone..."
        enableSearch={true}
        searchKeys={['name', 'phone', 'gstNumber']}
        onRowClick={(row) => {
          setSelectedSupplierId(row.id);
          setActiveSubTab('info');
        }}
      />

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeFormModal}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit(onSubmit)}>
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Supplier Name *"
            placeholder="Enter supplier company name"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              placeholder="e.g. +91 9988776655"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="GST Number"
              placeholder="15-digit GSTIN (Optional)"
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          </div>
          <Input
            label="Street Address *"
            placeholder="Enter warehouse or farmhouse address"
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opening Balance (INR) *"
              type="number"
              error={errors.openingBalance?.message}
              {...register('openingBalance')}
              disabled={!!editingSupplier}
              helperText="Set supplier's initial unpaid balance"
            />
            <Input
              label="Credit Limit (INR) *"
              type="number"
              error={errors.creditLimit?.message}
              {...register('creditLimit')}
            />
          </div>
          <Textarea
            label="Notes / Special Rules"
            placeholder="Payment term cycles, quality conditions..."
            error={errors.notes?.message}
            {...register('notes')}
          />
        </form>
      </Modal>
    </div>
  );
};
