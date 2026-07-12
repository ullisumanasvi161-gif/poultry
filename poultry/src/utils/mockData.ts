import { Customer, Supplier, Purchase, Sales, Payment, Expense, Inventory, MarketRate, Settings, LedgerEntry } from '../types';

export const initialSettings: Settings = {
  companyName: 'Reddy Chicken and Mutton Poultry',
  phone: '+91 98765 43210',
  email: 'contact@srpoultry.com',
  address: 'Plot No. 45, Industrial Area, Hyderabad, Telangana, 500051',
  gstNumber: '36AAAAA1111A1Z1',
  invoicePrefix: 'RCMP/INV/',
  receiptPrefix: 'RCMP/PUR/',
  termsAndConditions: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not cleared within credit limit.\n3. Subject to Hyderabad Jurisdiction.',
  printerWidth: '80mm',
  language: 'English',
  theme: 'light',
  managerMobile: '9876543210',
  securityQuestion: 'What is your favourite food?',
  securityAnswer: 'Chicken',
  loginPin: '1234',
};

export const initialSuppliers: Supplier[] = [];

export const initialCustomers: Customer[] = [];

export const initialMarketRates: MarketRate[] = [
  { id: 'rate_1', chickenType: 'Broiler (Live)', purchaseRate: 0, sellingRate: 0, date: '2026-07-12' },
  { id: 'rate_4', chickenType: 'Country Chicken', purchaseRate: 0, sellingRate: 0, date: '2026-07-12' },
];

export const initialInventory: Inventory = {
  liveWeight: 0,
  processedWeight: 0,
  deadWeight: 0,
  returnedWeight: 0,
  history: [],
};

export const initialPurchases: Purchase[] = [];

export const initialSales: Sales[] = [];

export const initialPayments: Payment[] = [];

export const initialExpenses: Expense[] = [];

export const initialLedgerEntries: LedgerEntry[] = [];

// Seed market rates history for chart visualization
export const marketRateHistory = [
  { date: '07-06', Broiler: 0, Country: 0 },
  { date: '07-07', Broiler: 0, Country: 0 },
  { date: '07-08', Broiler: 0, Country: 0 },
  { date: '07-09', Broiler: 0, Country: 0 },
  { date: '07-10', Broiler: 0, Country: 0 },
  { date: '07-11', Broiler: 0, Country: 0 },
  { date: '07-12', Broiler: 0, Country: 0 },
];

// Seed sales vs purchases trends for chart
export const salesVsPurchasesTrend = [
  { name: 'Mon', Sales: 0, Purchases: 0 },
  { name: 'Tue', Sales: 0, Purchases: 0 },
  { name: 'Wed', Sales: 0, Purchases: 0 },
  { name: 'Thu', Sales: 0, Purchases: 0 },
  { name: 'Fri', Sales: 0, Purchases: 0 },
  { name: 'Sat', Sales: 0, Purchases: 0 },
  { name: 'Sun', Sales: 0, Purchases: 0 },
];
