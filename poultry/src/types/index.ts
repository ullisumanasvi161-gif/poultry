export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  gstNumber: string;
  openingBalance: number;
  creditLimit: number;
  notes?: string;
  outstandingBalance: number;
}

export interface Customer {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  gstNumber: string;
  openingBalance: number;
  creditLimit: number;
  outstandingBalance: number;
}

export type ChickenType = 'Broiler (Live)' | 'Country Chicken';

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  date: string;
  chickenType: ChickenType;
  weight: number; // in KG
  rate: number; // per KG
  transportCharge: number;
  loadingCharge: number;
  commission: number;
  discount: number;
  gst: number; // percentage (e.g., 5, 12, 18)
  totalAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit';
}

export interface Sales {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  chickenType: ChickenType;
  weight: number; // in KG
  sellingRate: number; // per KG
  discount: number;
  packingCharge: number;
  deliveryCharge: number;
  gst: number; // percentage
  totalAmount: number;
  paymentType: 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit';
}

export interface LedgerEntry {
  id: string;
  partyId: string;
  partyType: 'customer' | 'supplier';
  date: string;
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  description: string;
  referenceId?: string; // invoiceNumber, purchaseNumber or paymentId
}

export interface Payment {
  id: string;
  partyId: string;
  partyType: 'customer' | 'supplier';
  date: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI';
  notes?: string;
}

export type ExpenseCategory = 'Fuel' | 'Transport' | 'Salary' | 'Electricity' | 'Maintenance' | 'Miscellaneous';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

export interface Inventory {
  liveWeight: number; // current live bird stock in KG
  processedWeight: number; // processed chicken in KG
  deadWeight: number; // dead stock weight in KG
  returnedWeight: number; // returned stock weight in KG
  history: {
    id: string;
    date: string;
    type: 'purchase' | 'sale' | 'dead' | 'return';
    chickenType: ChickenType;
    weight: number;
    notes: string;
  }[];
}

export interface MarketRate {
  id: string;
  chickenType: ChickenType;
  purchaseRate: number;
  sellingRate: number;
  date: string;
}

export interface Settings {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  invoicePrefix: string;
  receiptPrefix: string;
  termsAndConditions: string;
  printerWidth: '58mm' | '80mm';
  language: 'English' | 'Hindi' | 'Telugu';
  theme: 'light' | 'dark';
  managerMobile: string;
  securityQuestion: string;
  securityAnswer: string;
  loginPin: string;
}
