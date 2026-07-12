import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Purchases } from './pages/Purchases';
import { SalesBilling } from './pages/Sales';
import { Suppliers } from './pages/Suppliers';
import { Customers } from './pages/Customers';
import { MarketRates } from './pages/MarketRate';
import { InventoryPage } from './pages/Inventory';
import { Payments } from './pages/Payments';
import { Expenses } from './pages/Expenses';
import { Ledgers } from './pages/Ledgers';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { Login } from './pages/Login';

// Auth Route Guard Wrapper
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout />;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected ERP Application Routes */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="sales" element={<SalesBilling />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="market-rates" element={<MarketRates />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="payments" element={<Payments />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="ledgers" element={<Ledgers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
