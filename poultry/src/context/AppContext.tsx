import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Supplier, Purchase, Sales, Payment, Expense, Inventory, MarketRate, Settings, LedgerEntry, ChickenType } from '../types';
import { 
  initialSettings, 
  initialSuppliers, 
  initialCustomers, 
  initialMarketRates, 
  initialInventory, 
  initialPurchases, 
  initialSales, 
  initialPayments, 
  initialExpenses,
  initialLedgerEntries,
  marketRateHistory,
  salesVsPurchasesTrend
} from '../utils/mockData';
import { generateId } from '../utils/helpers';

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
  rateHistory: typeof marketRateHistory;
  salesTrend: typeof salesVsPurchasesTrend;
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
  // Global states
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [sales, setSales] = useState<Sales[]>(initialSales);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [marketRates, setMarketRates] = useState<MarketRate[]>(initialMarketRates);
  const [rateHistory, setRateHistory] = useState(marketRateHistory);
  const [salesTrend, setSalesTrend] = useState(salesVsPurchasesTrend);
  const [inventory, setInventory] = useState<Inventory>(initialInventory);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLedgerEntries);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sr_poultry_auth') === 'true';
  });

  const login = async (mobileNumber: string, pin: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (mobileNumber === settings.managerMobile && pin === settings.loginPin) {
      setIsAuthenticated(true);
      localStorage.setItem('sr_poultry_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sr_poultry_auth');
  };

  const updatePin = (newPin: string) => {
    setSettings(prev => ({
      ...prev,
      loginPin: newPin
    }));
  };

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const hideToast = () => {
    setToastType(null);
  };

  // Dark Mode side effects
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  // Update Settings
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    showToast('Settings updated successfully', 'success');
  };

  // Supplier Management Actions
  const addSupplier = (newSup: Omit<Supplier, 'id' | 'outstandingBalance'>) => {
    const id = generateId('sup');
    const supplier: Supplier = {
      ...newSup,
      id,
      outstandingBalance: newSup.openingBalance,
    };
    setSuppliers(prev => [...prev, supplier]);
    
    // Log Opening Balance Ledger Entry
    const ledgerEntry: LedgerEntry = {
      id: generateId('led'),
      partyId: id,
      partyType: 'supplier',
      date: new Date().toISOString().slice(0, 10),
      type: 'credit',
      amount: newSup.openingBalance,
      balance: newSup.openingBalance,
      description: 'Opening Balance',
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);
    showToast(`Supplier "${supplier.name}" added successfully`, 'success');
  };

  const editSupplier = (updatedSup: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSup.id ? updatedSup : s));
    showToast(`Supplier details updated`, 'success');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    showToast('Supplier deleted', 'info');
  };

  // Customer Management Actions
  const addCustomer = (newCust: Omit<Customer, 'id' | 'outstandingBalance'>) => {
    const id = generateId('cust');
    const customer: Customer = {
      ...newCust,
      id,
      outstandingBalance: newCust.openingBalance,
    };
    setCustomers(prev => [...prev, customer]);
    
    // Log Opening Balance Ledger Entry
    const ledgerEntry: LedgerEntry = {
      id: generateId('led'),
      partyId: id,
      partyType: 'customer',
      date: new Date().toISOString().slice(0, 10),
      type: 'debit',
      amount: newCust.openingBalance,
      balance: newCust.openingBalance,
      description: 'Opening Balance',
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);
    showToast(`Customer "${customer.name}" added successfully`, 'success');
  };

  const editCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    showToast(`Customer details updated`, 'success');
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast('Customer deleted', 'info');
  };

  // Purchase Actions
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'purchaseNumber'>) => {
    const id = generateId('pur');
    const runningCount = purchases.length + 1;
    const purchaseNumber = `${settings.receiptPrefix}${new Date().getFullYear()}/${String(runningCount).padStart(3, '0')}`;
    
    const purchase: Purchase = {
      ...purchaseData,
      id,
      purchaseNumber,
    };

    setPurchases(prev => [purchase, ...prev]);

    // 1. Update Supplier outstanding balance if Credit payment method
    let finalOutstanding = 0;
    if (purchase.paymentMethod === 'Credit') {
      setSuppliers(prev => prev.map(s => {
        if (s.id === purchase.supplierId) {
          finalOutstanding = s.outstandingBalance + purchase.totalAmount;
          return { ...s, outstandingBalance: finalOutstanding };
        }
        return s;
      }));
    } else {
      const supplier = suppliers.find(s => s.id === purchase.supplierId);
      finalOutstanding = supplier ? supplier.outstandingBalance : 0;
    }

    // 2. Add Ledger Entry
    const ledgerEntry: LedgerEntry = {
      id: generateId('led'),
      partyId: purchase.supplierId,
      partyType: 'supplier',
      date: purchase.date,
      type: 'credit',
      amount: purchase.totalAmount,
      balance: finalOutstanding,
      description: `Purchase Receipt ${purchaseNumber} (${purchase.paymentMethod})`,
      referenceId: id,
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);

    // If cash/upi, also log a corresponding payment debit entry to clear it instantly
    if (purchase.paymentMethod !== 'Credit') {
      const paymentLedgerEntry: LedgerEntry = {
        id: generateId('led'),
        partyId: purchase.supplierId,
        partyType: 'supplier',
        date: purchase.date,
        type: 'debit',
        amount: purchase.totalAmount,
        balance: finalOutstanding,
        description: `Paid via ${purchase.paymentMethod} for Receipt ${purchaseNumber}`,
        referenceId: id,
      };
      setLedgerEntries(prev => [...prev, paymentLedgerEntry]);
    }

    // 3. Update Inventory Stock (add weight)
    setInventory(prev => ({
      ...prev,
      liveWeight: prev.liveWeight + purchase.weight,
      history: [
        {
          id: generateId('inv_h'),
          date: purchase.date,
          type: 'purchase',
          chickenType: purchase.chickenType,
          weight: purchase.weight,
          notes: `Added Stock via Purchase ${purchaseNumber}`,
        },
        ...prev.history,
      ]
    }));

    // 4. Update salesTrend (Add to Purchases)
    const today = new Date(purchase.date).toLocaleDateString('en-US', { weekday: 'short' });
    setSalesTrend(prev => prev.map(t => t.name === today ? { ...t, Purchases: t.Purchases + purchase.totalAmount } : t));

    showToast(`Purchase logged successfully: ${purchaseNumber}`, 'success');
  };

  // Sales Actions
  const addSales = (salesData: Omit<Sales, 'id' | 'invoiceNumber'>) => {
    const id = generateId('sale');
    const runningCount = sales.length + 1;
    const invoiceNumber = `${settings.invoicePrefix}${new Date().getFullYear()}/${String(runningCount).padStart(3, '0')}`;
    
    const sale: Sales = {
      ...salesData,
      id,
      invoiceNumber,
    };

    setSales(prev => [sale, ...prev]);

    // 1. Update Customer outstanding balance if Credit
    let finalOutstanding = 0;
    if (sale.paymentType === 'Credit') {
      setCustomers(prev => prev.map(c => {
        if (c.id === sale.customerId) {
          finalOutstanding = c.outstandingBalance + sale.totalAmount;
          return { ...c, outstandingBalance: finalOutstanding };
        }
        return c;
      }));
    } else {
      const customer = customers.find(c => c.id === sale.customerId);
      finalOutstanding = customer ? customer.outstandingBalance : 0;
    }

    // 2. Add Ledger Entry
    const ledgerEntry: LedgerEntry = {
      id: generateId('led'),
      partyId: sale.customerId,
      partyType: 'customer',
      date: sale.date,
      type: 'debit',
      amount: sale.totalAmount,
      balance: finalOutstanding,
      description: `Invoice ${invoiceNumber} (${sale.paymentType})`,
      referenceId: id,
    };
    setLedgerEntries(prev => [...prev, ledgerEntry]);

    // If paid instantly, also log a corresponding credit payment ledger entry
    if (sale.paymentType !== 'Credit') {
      const paymentLedgerEntry: LedgerEntry = {
        id: generateId('led'),
        partyId: sale.customerId,
        partyType: 'customer',
        date: sale.date,
        type: 'credit',
        amount: sale.totalAmount,
        balance: finalOutstanding,
        description: `Received Cash/UPI for Invoice ${invoiceNumber}`,
        referenceId: id,
      };
      setLedgerEntries(prev => [...prev, paymentLedgerEntry]);
    }

    // 3. Update Inventory Stock (subtract weight)
    setInventory(prev => ({
      ...prev,
      liveWeight: Math.max(0, prev.liveWeight - sale.weight),
      history: [
        {
          id: generateId('inv_h'),
          date: sale.date,
          type: 'sale',
          chickenType: sale.chickenType,
          weight: sale.weight,
          notes: `Stock Deducted via Invoice ${invoiceNumber}`,
        },
        ...prev.history,
      ]
    }));

    // 4. Update salesTrend (Add to Sales)
    const today = new Date(sale.date).toLocaleDateString('en-US', { weekday: 'short' });
    setSalesTrend(prev => prev.map(t => t.name === today ? { ...t, Sales: t.Sales + sale.totalAmount } : t));

    showToast(`Invoice generated successfully: ${invoiceNumber}`, 'success');
  };

  // Payments Actions (Customer receipts / Supplier payments)
  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const id = generateId('pay');
    const payment: Payment = {
      ...paymentData,
      id,
    };

    setPayments(prev => [payment, ...prev]);

    if (payment.partyType === 'customer') {
      // Receive money from customer -> outstanding balance drops
      let finalOutstanding = 0;
      setCustomers(prev => prev.map(c => {
        if (c.id === payment.partyId) {
          finalOutstanding = Math.max(0, c.outstandingBalance - payment.amount);
          return { ...c, outstandingBalance: finalOutstanding };
        }
        return c;
      }));

      // Add customer ledger credit entry
      const ledgerEntry: LedgerEntry = {
        id: generateId('led'),
        partyId: payment.partyId,
        partyType: 'customer',
        date: payment.date,
        type: 'credit',
        amount: payment.amount,
        balance: finalOutstanding,
        description: `Payment received via ${payment.paymentMethod}. ${payment.notes || ''}`,
        referenceId: id,
      };
      setLedgerEntries(prev => [...prev, ledgerEntry]);
      showToast(`Payment of ${payment.amount} received from customer`, 'success');
    } else {
      // Pay money to supplier -> outstanding balance drops
      let finalOutstanding = 0;
      setSuppliers(prev => prev.map(s => {
        if (s.id === payment.partyId) {
          finalOutstanding = Math.max(0, s.outstandingBalance - payment.amount);
          return { ...s, outstandingBalance: finalOutstanding };
        }
        return s;
      }));

      // Add supplier ledger debit entry
      const ledgerEntry: LedgerEntry = {
        id: generateId('led'),
        partyId: payment.partyId,
        partyType: 'supplier',
        date: payment.date,
        type: 'debit',
        amount: payment.amount,
        balance: finalOutstanding,
        description: `Payment made via ${payment.paymentMethod}. ${payment.notes || ''}`,
        referenceId: id,
      };
      setLedgerEntries(prev => [...prev, ledgerEntry]);
      showToast(`Payment of ${payment.amount} made to supplier`, 'success');
    }
  };

  // Expense Management
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const id = generateId('exp');
    const expense: Expense = {
      ...expenseData,
      id,
    };
    setExpenses(prev => [expense, ...prev]);
    showToast(`Expense recorded under "${expense.category}"`, 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense deleted', 'info');
  };

  // Market Rate Actions
  const updateMarketRate = (id: string, purchaseRate: number, sellingRate: number) => {
    setMarketRates(prev => prev.map(r => r.id === id ? { ...r, purchaseRate, sellingRate } : r));
    
    // Optionally update trend history for chart
    const updatedRate = marketRates.find(r => r.id === id);
    if (updatedRate && updatedRate.chickenType === 'Broiler (Live)') {
      setRateHistory(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          ...next[next.length - 1],
          Broiler: purchaseRate,
        };
        return next;
      });
    }
    showToast('Market rate updated', 'success');
  };

  // Inventory Adjustments (Mortality/Returns)
  const addDeadStock = (weight: number, chickenType: ChickenType, notes: string) => {
    setInventory(prev => ({
      ...prev,
      liveWeight: Math.max(0, prev.liveWeight - weight),
      deadWeight: prev.deadWeight + weight,
      history: [
        {
          id: generateId('inv_h'),
          date: new Date().toISOString().slice(0, 10),
          type: 'dead',
          chickenType,
          weight,
          notes: `Recorded mortality: ${notes}`,
        },
        ...prev.history,
      ]
    }));

    // Record dead stock as an expense loss
    const rate = marketRates.find(r => r.chickenType === chickenType)?.purchaseRate || 100;
    const lossAmount = weight * rate;
    addExpense({
      category: 'Miscellaneous',
      amount: lossAmount,
      date: new Date().toISOString().slice(0, 10),
      description: `Mortality loss: ${weight} KG of ${chickenType} (Est. Cost ${lossAmount})`,
    });

    showToast(`Dead stock registered: ${weight} KG. Stock decremented.`, 'warning');
  };

  const addReturnedStock = (weight: number, chickenType: ChickenType, notes: string) => {
    setInventory(prev => ({
      ...prev,
      liveWeight: prev.liveWeight + weight,
      returnedWeight: prev.returnedWeight + weight,
      history: [
        {
          id: generateId('inv_h'),
          date: new Date().toISOString().slice(0, 10),
          type: 'return',
          chickenType,
          weight,
          notes: `Customer return: ${notes}`,
        },
        ...prev.history,
      ]
    }));
    showToast(`Returned stock registered: ${weight} KG. Stock incremented.`, 'info');
  };

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      suppliers,
      addSupplier,
      editSupplier,
      deleteSupplier,
      customers,
      addCustomer,
      editCustomer,
      deleteCustomer,
      purchases,
      addPurchase,
      sales,
      addSales,
      payments,
      addPayment,
      expenses,
      addExpense,
      deleteExpense,
      marketRates,
      updateMarketRate,
      rateHistory,
      salesTrend,
      inventory,
      addDeadStock,
      addReturnedStock,
      ledgerEntries,
      toast: {
        message: toastMessage,
        type: toastType,
        show: showToast,
        hide: hideToast,
      },
      isAuthenticated,
      login,
      logout,
      updatePin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
