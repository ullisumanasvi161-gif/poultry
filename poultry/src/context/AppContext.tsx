import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Supplier, Purchase, Sales, Payment, Expense, Inventory, MarketRate, Settings, LedgerEntry, ChickenType } from '../types';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils/helpers';

// --- DEFAULT VALUES ---
const DEFAULT_SETTINGS: Settings = {
  companyName: 'Reddy Chicken and Mutton Poultry',
  phone: '', email: '', address: '', gstNumber: '',
  invoicePrefix: 'INV', receiptPrefix: 'PUR',
  termsAndConditions: '', printerWidth: '80mm',
  language: 'English', theme: 'light',
  managerMobile: '9876543210', securityQuestion: '', securityAnswer: '', loginPin: '1234',
};

const DEFAULT_INVENTORY: Inventory = {
  liveWeight: 0, processedWeight: 0, deadWeight: 0, returnedWeight: 0, history: [],
};

// --- DB ROW <-> APP TYPE MAPPERS ---
function rowToSettings(row: any): Settings {
  return {
    companyName: row.company_name, phone: row.phone, email: row.email,
    address: row.address, gstNumber: row.gst_number,
    invoicePrefix: row.invoice_prefix, receiptPrefix: row.receipt_prefix,
    termsAndConditions: row.terms_and_conditions, printerWidth: row.printer_width,
    language: row.language, theme: row.theme,
    managerMobile: row.manager_mobile, securityQuestion: row.security_question,
    securityAnswer: row.security_answer, loginPin: row.login_pin,
  };
}

function settingsToRow(s: Settings) {
  return {
    company_name: s.companyName, phone: s.phone, email: s.email,
    address: s.address, gst_number: s.gstNumber,
    invoice_prefix: s.invoicePrefix, receipt_prefix: s.receiptPrefix,
    terms_and_conditions: s.termsAndConditions, printer_width: s.printerWidth,
    language: s.language, theme: s.theme,
    manager_mobile: s.managerMobile, security_question: s.securityQuestion,
    security_answer: s.securityAnswer, login_pin: s.loginPin,
  };
}

function rowToSupplier(row: any): Supplier {
  return {
    id: row.id, name: row.name, phone: row.phone, address: row.address,
    gstNumber: row.gst_number, openingBalance: Number(row.opening_balance),
    creditLimit: Number(row.credit_limit), notes: row.notes,
    outstandingBalance: Number(row.outstanding_balance),
  };
}

function rowToCustomer(row: any): Customer {
  return {
    id: row.id, name: row.name, shopName: row.shop_name, phone: row.phone,
    address: row.address, gstNumber: row.gst_number,
    openingBalance: Number(row.opening_balance), creditLimit: Number(row.credit_limit),
    outstandingBalance: Number(row.outstanding_balance),
  };
}

function rowToPurchase(row: any): Purchase {
  return {
    id: row.id, purchaseNumber: row.purchase_number, supplierId: row.supplier_id,
    date: row.date, chickenType: row.chicken_type as ChickenType,
    weight: Number(row.weight), rate: Number(row.rate),
    transportCharge: Number(row.transport_charge), loadingCharge: Number(row.loading_charge),
    commission: Number(row.commission), discount: Number(row.discount),
    gst: Number(row.gst), totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
  };
}

function rowToSale(row: any): Sales {
  return {
    id: row.id, invoiceNumber: row.invoice_number, customerId: row.customer_id,
    date: row.date, chickenType: row.chicken_type as ChickenType,
    weight: Number(row.weight), sellingRate: Number(row.selling_rate),
    discount: Number(row.discount), packingCharge: Number(row.packing_charge),
    deliveryCharge: Number(row.delivery_charge), gst: Number(row.gst),
    totalAmount: Number(row.total_amount), paymentType: row.payment_type,
  };
}

function rowToPayment(row: any): Payment {
  return {
    id: row.id, partyId: row.party_id, partyType: row.party_type,
    date: row.date, amount: Number(row.amount),
    paymentMethod: row.payment_method, notes: row.notes,
  };
}

function rowToExpense(row: any): Expense {
  return {
    id: row.id, category: row.category, amount: Number(row.amount),
    date: row.date, description: row.description,
  };
}

function rowToMarketRate(row: any): MarketRate {
  return {
    id: row.id, chickenType: row.chicken_type as ChickenType,
    purchaseRate: Number(row.purchase_rate), sellingRate: Number(row.selling_rate),
    date: row.date,
  };
}

function rowToLedger(row: any): LedgerEntry {
  return {
    id: row.id, partyId: row.party_id, partyType: row.party_type,
    date: row.date, type: row.type, amount: Number(row.amount),
    balance: Number(row.balance), description: row.description,
    referenceId: row.reference_id,
  };
}

// --- CONTEXT INTERFACE ---
interface AppContextProps {
  settings: Settings;
  updateSettings: (settings: Settings) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingBalance'>) => void;
  editSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'outstandingBalance'>) => void;
  editCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  purchases: Purchase[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNumber'>) => void;
  sales: Sales[];
  addSales: (sale: Omit<Sales, 'id' | 'invoiceNumber'>) => void;
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  marketRates: MarketRate[];
  updateMarketRate: (id: string, purchaseRate: number, sellingRate: number) => void;
  rateHistory: any[];
  salesTrend: any[];
  inventory: Inventory;
  addDeadStock: (weight: number, chickenType: ChickenType, notes: string) => void;
  addReturnedStock: (weight: number, chickenType: ChickenType, notes: string) => void;
  ledgerEntries: LedgerEntry[];
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning' | null;
    show: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    hide: () => void;
  };
  isAuthenticated: boolean;
  login: (mobileNumber: string, pin: string) => Promise<boolean>;
  logout: () => void;
  updatePin: (newPin: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sales[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [rateHistory] = useState<any[]>([]);
  const [salesTrend] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Inventory>(DEFAULT_INVENTORY);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('sr_poultry_auth') === 'true');

  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setToastMessage(msg); setToastType(type); };
  const hideToast = () => setToastType(null);

  // Dark mode
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  // --- REAL-TIME SUBSCRIPTIONS & INITIAL LOAD ---
  useEffect(() => {
    // Initial fetches
    supabase.from('settings').select('*').eq('id', 'main').single().then(({ data }) => {
      if (data) setSettings(rowToSettings(data));
    });
    supabase.from('inventory').select('*').eq('id', 'main').single().then(({ data }) => {
      if (data) {
        supabase.from('inventory_history').select('*').order('created_at', { ascending: false }).then(({ data: hist }) => {
          setInventory({ ...DEFAULT_INVENTORY, liveWeight: Number(data.live_weight), processedWeight: Number(data.processed_weight), deadWeight: Number(data.dead_weight), returnedWeight: Number(data.returned_weight), history: (hist || []).map((h: any) => ({ id: h.id, date: h.date, type: h.type, chickenType: h.chicken_type, weight: Number(h.weight), notes: h.notes })) });
        });
      }
    });
    supabase.from('suppliers').select('*').then(({ data }) => { if (data) setSuppliers(data.map(rowToSupplier)); });
    supabase.from('customers').select('*').then(({ data }) => { if (data) setCustomers(data.map(rowToCustomer)); });
    supabase.from('purchases').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setPurchases(data.map(rowToPurchase)); });
    supabase.from('sales').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setSales(data.map(rowToSale)); });
    supabase.from('payments').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setPayments(data.map(rowToPayment)); });
    supabase.from('expenses').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setExpenses(data.map(rowToExpense)); });
    supabase.from('market_rates').select('*').then(({ data }) => { if (data) setMarketRates(data.map(rowToMarketRate)); });
    supabase.from('ledger_entries').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setLedgerEntries(data.map(rowToLedger)); });

    // Real-time subscriptions
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        supabase.from('settings').select('*').eq('id', 'main').single().then(({ data }) => { if (data) setSettings(rowToSettings(data)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
        supabase.from('suppliers').select('*').then(({ data }) => { if (data) setSuppliers(data.map(rowToSupplier)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        supabase.from('customers').select('*').then(({ data }) => { if (data) setCustomers(data.map(rowToCustomer)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, () => {
        supabase.from('purchases').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setPurchases(data.map(rowToPurchase)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        supabase.from('sales').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setSales(data.map(rowToSale)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        supabase.from('payments').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setPayments(data.map(rowToPayment)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        supabase.from('expenses').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setExpenses(data.map(rowToExpense)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_rates' }, () => {
        supabase.from('market_rates').select('*').then(({ data }) => { if (data) setMarketRates(data.map(rowToMarketRate)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger_entries' }, () => {
        supabase.from('ledger_entries').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setLedgerEntries(data.map(rowToLedger)); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        supabase.from('inventory').select('*').eq('id', 'main').single().then(({ data }) => {
          if (data) {
            supabase.from('inventory_history').select('*').order('created_at', { ascending: false }).then(({ data: hist }) => {
              setInventory({ ...DEFAULT_INVENTORY, liveWeight: Number(data.live_weight), processedWeight: Number(data.processed_weight), deadWeight: Number(data.dead_weight), returnedWeight: Number(data.returned_weight), history: (hist || []).map((h: any) => ({ id: h.id, date: h.date, type: h.type, chickenType: h.chicken_type, weight: Number(h.weight), notes: h.notes })) });
            });
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_history' }, () => {
        supabase.from('inventory').select('*').eq('id', 'main').single().then(({ data }) => {
          if (data) {
            supabase.from('inventory_history').select('*').order('created_at', { ascending: false }).then(({ data: hist }) => {
              setInventory({ ...DEFAULT_INVENTORY, liveWeight: Number(data.live_weight), processedWeight: Number(data.processed_weight), deadWeight: Number(data.dead_weight), returnedWeight: Number(data.returned_weight), history: (hist || []).map((h: any) => ({ id: h.id, date: h.date, type: h.type, chickenType: h.chicken_type, weight: Number(h.weight), notes: h.notes })) });
            });
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const login = async (mobileNumber: string, pin: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (mobileNumber === settings.managerMobile && pin === settings.loginPin) {
      setIsAuthenticated(true);
      localStorage.setItem('sr_poultry_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => { setIsAuthenticated(false); localStorage.removeItem('sr_poultry_auth'); };

  const updatePin = (newPin: string) => {
    supabase.from('settings').update({ login_pin: newPin }).eq('id', 'main');
  };

  const updateSettings = async (newSettings: Settings) => {
    await supabase.from('settings').update(settingsToRow(newSettings)).eq('id', 'main');
    showToast('Settings updated successfully', 'success');
  };

  const addSupplier = async (newSup: Omit<Supplier, 'id' | 'outstandingBalance'>) => {
    const id = generateId('sup');
    await supabase.from('suppliers').insert({
      id, name: newSup.name, phone: newSup.phone, address: newSup.address,
      gst_number: newSup.gstNumber, opening_balance: newSup.openingBalance,
      credit_limit: newSup.creditLimit, notes: newSup.notes || '',
      outstanding_balance: newSup.openingBalance,
    });
    await supabase.from('ledger_entries').insert({
      id: generateId('led'), party_id: id, party_type: 'supplier',
      date: new Date().toISOString().slice(0, 10), type: 'credit',
      amount: newSup.openingBalance, balance: newSup.openingBalance, description: 'Opening Balance',
    });
    showToast(`Supplier "${newSup.name}" added successfully`, 'success');
  };

  const editSupplier = async (s: Supplier) => {
    await supabase.from('suppliers').update({
      name: s.name, phone: s.phone, address: s.address, gst_number: s.gstNumber,
      opening_balance: s.openingBalance, credit_limit: s.creditLimit,
      notes: s.notes || '', outstanding_balance: s.outstandingBalance,
    }).eq('id', s.id);
    showToast('Supplier details updated', 'success');
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    showToast('Supplier deleted', 'info');
  };

  const addCustomer = async (newCust: Omit<Customer, 'id' | 'outstandingBalance'>) => {
    const id = generateId('cust');
    await supabase.from('customers').insert({
      id, name: newCust.name, shop_name: newCust.shopName, phone: newCust.phone,
      address: newCust.address, gst_number: newCust.gstNumber,
      opening_balance: newCust.openingBalance, credit_limit: newCust.creditLimit,
      outstanding_balance: newCust.openingBalance,
    });
    await supabase.from('ledger_entries').insert({
      id: generateId('led'), party_id: id, party_type: 'customer',
      date: new Date().toISOString().slice(0, 10), type: 'debit',
      amount: newCust.openingBalance, balance: newCust.openingBalance, description: 'Opening Balance',
    });
    showToast(`Customer "${newCust.name}" added successfully`, 'success');
  };

  const editCustomer = async (c: Customer) => {
    await supabase.from('customers').update({
      name: c.name, shop_name: c.shopName, phone: c.phone, address: c.address,
      gst_number: c.gstNumber, opening_balance: c.openingBalance,
      credit_limit: c.creditLimit, outstanding_balance: c.outstandingBalance,
    }).eq('id', c.id);
    showToast('Customer details updated', 'success');
  };

  const deleteCustomer = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id);
    showToast('Customer deleted', 'info');
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'purchaseNumber'>) => {
    const id = generateId('pur');
    const runningCount = purchases.length + 1;
    const purchaseNumber = `${settings.receiptPrefix}${new Date().getFullYear()}/${String(runningCount).padStart(3, '0')}`;

    await supabase.from('purchases').insert({
      id, purchase_number: purchaseNumber, supplier_id: purchaseData.supplierId,
      date: purchaseData.date, chicken_type: purchaseData.chickenType,
      weight: purchaseData.weight, rate: purchaseData.rate,
      transport_charge: purchaseData.transportCharge, loading_charge: purchaseData.loadingCharge,
      commission: purchaseData.commission, discount: purchaseData.discount,
      gst: purchaseData.gst, total_amount: purchaseData.totalAmount,
      payment_method: purchaseData.paymentMethod,
    });

    let finalOutstanding = 0;
    if (purchaseData.paymentMethod === 'Credit') {
      const s = suppliers.find(sup => sup.id === purchaseData.supplierId);
      if (s) {
        finalOutstanding = s.outstandingBalance + purchaseData.totalAmount;
        await supabase.from('suppliers').update({ outstanding_balance: finalOutstanding }).eq('id', s.id);
      }
    } else {
      const s = suppliers.find(sup => sup.id === purchaseData.supplierId);
      if (s) finalOutstanding = s.outstandingBalance;
    }

    await supabase.from('ledger_entries').insert({
      id: generateId('led'), party_id: purchaseData.supplierId, party_type: 'supplier',
      date: purchaseData.date, type: 'credit', amount: purchaseData.totalAmount,
      balance: finalOutstanding, description: `Purchase Receipt ${purchaseNumber} (${purchaseData.paymentMethod})`, reference_id: id,
    });

    if (purchaseData.paymentMethod !== 'Credit') {
      await supabase.from('ledger_entries').insert({
        id: generateId('led'), party_id: purchaseData.supplierId, party_type: 'supplier',
        date: purchaseData.date, type: 'debit', amount: purchaseData.totalAmount,
        balance: finalOutstanding, description: `Paid via ${purchaseData.paymentMethod} for Receipt ${purchaseNumber}`, reference_id: id,
      });
    }

    // Update inventory
    const { data: invData } = await supabase.from('inventory').select('*').eq('id', 'main').single();
    if (invData) {
      await supabase.from('inventory').update({ live_weight: Number(invData.live_weight) + purchaseData.weight }).eq('id', 'main');
    }
    await supabase.from('inventory_history').insert({
      id: generateId('inv_h'), date: purchaseData.date, type: 'purchase',
      chicken_type: purchaseData.chickenType, weight: purchaseData.weight,
      notes: `Added Stock via Purchase ${purchaseNumber}`,
    });

    showToast(`Purchase logged successfully: ${purchaseNumber}`, 'success');
  };

  const addSales = async (salesData: Omit<Sales, 'id' | 'invoiceNumber'>) => {
    const id = generateId('sale');
    const runningCount = sales.length + 1;
    const invoiceNumber = `${settings.invoicePrefix}${new Date().getFullYear()}/${String(runningCount).padStart(3, '0')}`;

    await supabase.from('sales').insert({
      id, invoice_number: invoiceNumber, customer_id: salesData.customerId,
      date: salesData.date, chicken_type: salesData.chickenType,
      weight: salesData.weight, selling_rate: salesData.sellingRate,
      discount: salesData.discount, packing_charge: salesData.packingCharge,
      delivery_charge: salesData.deliveryCharge, gst: salesData.gst,
      total_amount: salesData.totalAmount, payment_type: salesData.paymentType,
    });

    let finalOutstanding = 0;
    if (salesData.paymentType === 'Credit') {
      const c = customers.find(cust => cust.id === salesData.customerId);
      if (c) {
        finalOutstanding = c.outstandingBalance + salesData.totalAmount;
        await supabase.from('customers').update({ outstanding_balance: finalOutstanding }).eq('id', c.id);
      }
    } else {
      const c = customers.find(cust => cust.id === salesData.customerId);
      if (c) finalOutstanding = c.outstandingBalance;
    }

    await supabase.from('ledger_entries').insert({
      id: generateId('led'), party_id: salesData.customerId, party_type: 'customer',
      date: salesData.date, type: 'debit', amount: salesData.totalAmount,
      balance: finalOutstanding, description: `Invoice ${invoiceNumber} (${salesData.paymentType})`, reference_id: id,
    });

    if (salesData.paymentType !== 'Credit') {
      await supabase.from('ledger_entries').insert({
        id: generateId('led'), party_id: salesData.customerId, party_type: 'customer',
        date: salesData.date, type: 'credit', amount: salesData.totalAmount,
        balance: finalOutstanding, description: `Received Cash/UPI for Invoice ${invoiceNumber}`, reference_id: id,
      });
    }

    // Update inventory
    const { data: invData } = await supabase.from('inventory').select('*').eq('id', 'main').single();
    if (invData) {
      await supabase.from('inventory').update({ live_weight: Math.max(0, Number(invData.live_weight) - salesData.weight) }).eq('id', 'main');
    }
    await supabase.from('inventory_history').insert({
      id: generateId('inv_h'), date: salesData.date, type: 'sale',
      chicken_type: salesData.chickenType, weight: salesData.weight,
      notes: `Stock Deducted via Invoice ${invoiceNumber}`,
    });

    showToast(`Invoice generated successfully: ${invoiceNumber}`, 'success');
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    const id = generateId('pay');
    await supabase.from('payments').insert({
      id, party_id: paymentData.partyId, party_type: paymentData.partyType,
      date: paymentData.date, amount: paymentData.amount,
      payment_method: paymentData.paymentMethod, notes: paymentData.notes || '',
    });

    if (paymentData.partyType === 'customer') {
      const c = customers.find(cust => cust.id === paymentData.partyId);
      let finalOutstanding = 0;
      if (c) {
        finalOutstanding = Math.max(0, c.outstandingBalance - paymentData.amount);
        await supabase.from('customers').update({ outstanding_balance: finalOutstanding }).eq('id', c.id);
      }
      await supabase.from('ledger_entries').insert({
        id: generateId('led'), party_id: paymentData.partyId, party_type: 'customer',
        date: paymentData.date, type: 'credit', amount: paymentData.amount,
        balance: finalOutstanding, description: `Payment received via ${paymentData.paymentMethod}. ${paymentData.notes || ''}`, reference_id: id,
      });
      showToast(`Payment of ${paymentData.amount} received from customer`, 'success');
    } else {
      const s = suppliers.find(sup => sup.id === paymentData.partyId);
      let finalOutstanding = 0;
      if (s) {
        finalOutstanding = Math.max(0, s.outstandingBalance - paymentData.amount);
        await supabase.from('suppliers').update({ outstanding_balance: finalOutstanding }).eq('id', s.id);
      }
      await supabase.from('ledger_entries').insert({
        id: generateId('led'), party_id: paymentData.partyId, party_type: 'supplier',
        date: paymentData.date, type: 'debit', amount: paymentData.amount,
        balance: finalOutstanding, description: `Payment made via ${paymentData.paymentMethod}. ${paymentData.notes || ''}`, reference_id: id,
      });
      showToast(`Payment of ${paymentData.amount} made to supplier`, 'success');
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const id = generateId('exp');
    await supabase.from('expenses').insert({
      id, category: expenseData.category, amount: expenseData.amount,
      date: expenseData.date, description: expenseData.description,
    });
    showToast(`Expense recorded under "${expenseData.category}"`, 'success');
  };

  const deleteExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    showToast('Expense deleted', 'info');
  };

  const updateMarketRate = async (id: string, purchaseRate: number, sellingRate: number) => {
    await supabase.from('market_rates').update({ purchase_rate: purchaseRate, selling_rate: sellingRate }).eq('id', id);
    showToast('Market rate updated', 'success');
  };

  const addDeadStock = async (weight: number, chickenType: ChickenType, notes: string) => {
    const { data: invData } = await supabase.from('inventory').select('*').eq('id', 'main').single();
    if (invData) {
      await supabase.from('inventory').update({
        live_weight: Math.max(0, Number(invData.live_weight) - weight),
        dead_weight: Number(invData.dead_weight) + weight,
      }).eq('id', 'main');
    }
    await supabase.from('inventory_history').insert({
      id: generateId('inv_h'), date: new Date().toISOString().slice(0, 10),
      type: 'dead', chicken_type: chickenType, weight, notes: `Recorded mortality: ${notes}`,
    });
    const rate = marketRates.find(r => r.chickenType === chickenType)?.purchaseRate || 100;
    const lossAmount = weight * rate;
    await addExpense({ category: 'Miscellaneous', amount: lossAmount, date: new Date().toISOString().slice(0, 10), description: `Mortality loss: ${weight} KG of ${chickenType} (Est. Cost ${lossAmount})` });
    showToast(`Dead stock registered: ${weight} KG. Stock decremented.`, 'warning');
  };

  const addReturnedStock = async (weight: number, chickenType: ChickenType, notes: string) => {
    const { data: invData } = await supabase.from('inventory').select('*').eq('id', 'main').single();
    if (invData) {
      await supabase.from('inventory').update({
        live_weight: Number(invData.live_weight) + weight,
        returned_weight: Number(invData.returned_weight) + weight,
      }).eq('id', 'main');
    }
    await supabase.from('inventory_history').insert({
      id: generateId('inv_h'), date: new Date().toISOString().slice(0, 10),
      type: 'return', chicken_type: chickenType, weight, notes: `Customer return: ${notes}`,
    });
    showToast(`Returned stock registered: ${weight} KG. Stock incremented.`, 'info');
  };

  return (
    <AppContext.Provider value={{
      settings, updateSettings, suppliers, addSupplier, editSupplier, deleteSupplier,
      customers, addCustomer, editCustomer, deleteCustomer, purchases, addPurchase,
      sales, addSales, payments, addPayment, expenses, addExpense, deleteExpense,
      marketRates, updateMarketRate, rateHistory, salesTrend, inventory, addDeadStock,
      addReturnedStock, ledgerEntries,
      toast: { message: toastMessage, type: toastType, show: showToast, hide: hideToast },
      isAuthenticated, login, logout, updatePin,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
