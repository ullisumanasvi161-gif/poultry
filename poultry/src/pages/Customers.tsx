import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/FormElements';
import { formatCurrency, formatWeight, formatDate } from '../utils/helpers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Phone, MapPin, Store, ArrowLeft, BookOpen, AlertTriangle } from 'lucide-react';
import { Customer } from '../types';

const customerSchema = z.object({
  name: z.string().min(3, 'Customer name is required'),
  shopName: z.string().min(3, 'Shop/Business name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').or(z.literal('')),
  openingBalance: z.coerce.number().min(0, 'Opening balance must be positive'),
  creditLimit: z.coerce.number().min(0, 'Credit limit must be positive'),
});

type CustomerFormInput = z.infer<typeof customerSchema>;

export const Customers: React.FC = () => {
  const { customers, addCustomer, editCustomer, deleteCustomer, sales, ledgerEntries } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'sales' | 'ledger'>('info');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      shopName: '',
      phone: '',
      address: '',
      gstNumber: '',
      openingBalance: 0,
      creditLimit: 100000,
    }
  });

  const onSubmit = (data: any) => {
    if (editingCustomer) {
      editCustomer({
        ...editingCustomer,
        ...data,
      });
    } else {
      addCustomer(data);
    }
    closeFormModal();
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    reset({
      name: '',
      shopName: '',
      phone: '',
      address: '',
      gstNumber: '',
      openingBalance: 0,
      creditLimit: 100000,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    reset({
      name: cust.name,
      shopName: cust.shopName,
      phone: cust.phone,
      address: cust.address,
      gstNumber: cust.gstNumber,
      openingBalance: cust.openingBalance,
      creditLimit: cust.creditLimit,
    });
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
      if (selectedCustomerId === id) setSelectedCustomerId(null);
    }
  };

  // Table Columns
  const columns = [
    {
      header: 'Shop Details',
      accessorKey: 'shopName',
      sortable: true,
      cell: (row: Customer) => (
        <div>
          <p className="font-bold text-slate-805 dark:text-white leading-tight">{row.shopName}</p>
          <p className="text-xxs text-slate-400 mt-1">Proprietor: {row.name}</p>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Credit Limit',
      accessorKey: 'creditLimit',
      sortable: true,
      cell: (row: Customer) => formatCurrency(row.creditLimit),
    },
    {
      header: 'Outstanding Balance',
      accessorKey: 'outstandingBalance',
      sortable: true,
      cell: (row: Customer) => (
        <span className={`font-semibold ${row.outstandingBalance > 0 ? 'text-emerald-600 dark:text-emerald-450 font-bold' : 'text-slate-500'}`}>
          {formatCurrency(row.outstandingBalance)}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row: Customer) => (
        <div className="flex items-center gap-1.5 no-print">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => openEditModal(row, e)}
            className="hover:text-amber-500"
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

  const customerSales = sales.filter(s => s.customerId === selectedCustomerId);
  const customerLedger = ledgerEntries
    .filter(l => l.partyId === selectedCustomerId && l.partyType === 'customer')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (selectedCustomer) {
    const usagePct = Math.min(100, Math.round((selectedCustomer.outstandingBalance / selectedCustomer.creditLimit) * 100)) || 0;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 text-slate-505 cursor-pointer dark:text-slate-300"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white margin-0">
                {selectedCustomer.shopName}
              </h1>
              <p className="text-xxs text-slate-400 mt-0.5">Proprietor: {selectedCustomer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button variant="outline" size="sm" onClick={(e) => openEditModal(selectedCustomer, e)} leftIcon={<Edit2 size={14} />}>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card borderAccent="emerald">
            <p className="text-xs text-slate-505 font-medium mb-1 dark:text-slate-400">Receivable Balance</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(selectedCustomer.outstandingBalance)}
            </h3>
            {selectedCustomer.outstandingBalance > selectedCustomer.creditLimit * 0.8 && (
              <p className="text-xxs text-rose-500 font-semibold mt-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Credit limit utilization alert
              </p>
            )}
          </Card>
          <Card borderAccent="emerald">
            <p className="text-xs text-slate-505 font-medium mb-1 dark:text-slate-400">Total Invoiced Amount</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(customerSales.reduce((sum, s) => sum + s.totalAmount, 0))}
            </h3>
            <p className="text-xxs text-slate-400 mt-2">Over {customerSales.length} total invoices</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between text-xs text-slate-505 mb-1 font-medium dark:text-slate-400">
              <span>Credit Limit Usage</span>
              <span>{formatCurrency(selectedCustomer.creditLimit)} limit</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{usagePct}%</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  usagePct > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Info / Sales / Ledger Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex border-b border-slate-100 dark:border-slate-850 px-6 bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setActiveSubTab('info')}
              className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
                activeSubTab === 'info' 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-505 hover:text-slate-800'
              }`}
            >
              Shop Profile
            </button>
            <button
              onClick={() => setActiveSubTab('sales')}
              className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
                activeSubTab === 'sales' 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-505 hover:text-slate-800'
              }`}
            >
              Invoice History ({customerSales.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-4 py-3.5 text-xs font-semibold border-b-2 transition duration-150 cursor-pointer ${
                activeSubTab === 'ledger' 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-505 hover:text-slate-800'
              }`}
            >
              Ledger Statements ({customerLedger.length})
            </button>
          </div>

          <div className="p-6">
            {activeSubTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4.5">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                    Business Coordinates
                  </h4>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Store size={16} className="text-slate-400" />
                    <span>Shop Name: {selectedCustomer.shopName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-slate-400" />
                    <span>Phone: {selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>Address: {selectedCustomer.address}</span>
                  </div>
                </div>
                
                <div className="space-y-4.5">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs border-b pb-2 dark:border-slate-800">
                    Tax & Policy Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">GST Registration</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                        {selectedCustomer.gstNumber || 'Unregistered / Retailer'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Opening Balance</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-1">
                        {formatCurrency(selectedCustomer.openingBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'sales' && (
              <Table 
                data={customerSales} 
                pageSize={5}
                columns={[
                  { header: 'Invoice No', accessorKey: 'invoiceNumber', sortable: true },
                  { header: 'Date', accessorKey: 'date', sortable: true, cell: (r) => formatDate(r.date) },
                  { header: 'Chicken Type', accessorKey: 'chickenType' },
                  { header: 'Weight', cell: (r) => formatWeight(r.weight) },
                  { header: 'Invoice Total', cell: (r) => formatCurrency(r.totalAmount) },
                  { header: 'Payment Method', accessorKey: 'paymentType' }
                ]}
              />
            )}

            {activeSubTab === 'ledger' && (
              <Table 
                data={customerLedger}
                pageSize={5}
                columns={[
                  { header: 'Date', accessorKey: 'date', cell: (r) => formatDate(r.date) },
                  { header: 'Description', accessorKey: 'description' },
                  { 
                    header: 'Debit (Invoice)', 
                    cell: (r) => r.type === 'debit' ? (
                      <span className="text-rose-500 font-semibold">{formatCurrency(r.amount)}</span>
                    ) : '-' 
                  },
                  { 
                    header: 'Credit (Paid)', 
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
            Customer Management
          </h1>
          <p className="text-sm text-slate-505 dark:text-slate-400 mt-1">
            Track business shops, balance due collection lists, and credit policies.
          </p>
        </div>
        <Button onClick={openAddModal} leftIcon={<Plus size={16} />} size="sm">
          Add Customer
        </Button>
      </div>

      <Table
        data={customers}
        columns={columns}
        searchPlaceholder="Search shop name, owner or phone..."
        enableSearch={true}
        searchKeys={['name', 'shopName', 'phone', 'gstNumber']}
        onRowClick={(row) => {
          setSelectedCustomerId(row.id);
          setActiveSubTab('info');
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeFormModal}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.shopName}` : 'Add New Customer'}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit(onSubmit)}>
              {editingCustomer ? 'Update Profile' : 'Create Customer'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Shop / Business Name *"
              placeholder="e.g. Suresh Chicken Center"
              error={errors.shopName?.message}
              {...register('shopName')}
            />
            <Input
              label="Owner / Proprietor Name *"
              placeholder="Enter full name"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              placeholder="10-digit number"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="GST Number (Optional)"
              placeholder="15-digit GSTIN"
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          </div>
          <Input
            label="Shop Street Address *"
            placeholder="Shop number, market center, street name"
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Opening Outstanding Balance (INR) *"
              type="number"
              error={errors.openingBalance?.message}
              {...register('openingBalance')}
              disabled={!!editingCustomer}
              helperText="Set customer's unpaid balance from past statements"
            />
            <Input
              label="Credit Limit (INR) *"
              type="number"
              error={errors.creditLimit?.message}
              {...register('creditLimit')}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
