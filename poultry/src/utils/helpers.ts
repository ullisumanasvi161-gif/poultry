import { Sales, Purchase } from '../types';

/**
 * Formats numbers into Indian Rupees currency format.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats numbers to KG weights.
 */
export const formatWeight = (weight: number): string => {
  return `${weight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG`;
};

/**
 * Formats date string into readable format (e.g. DD-MM-YYYY)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Generates a random alphanumeric ID.
 */
export const generateId = (prefix: string = ''): string => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generates structured text for WhatsApp sharing of a sales invoice
 */
export const getSalesWhatsAppText = (sale: Sales, customerName: string, shopName: string, companyName: string): string => {
  return encodeURIComponent(
    `*${companyName}*\n` +
    `---------------------------------\n` +
    `*INVOICE DETAILS*\n` +
    `---------------------------------\n` +
    `*Invoice No:* ${sale.invoiceNumber}\n` +
    `*Date:* ${formatDate(sale.date)}\n` +
    `*Customer:* ${customerName} (${shopName})\n` +
    `*Item:* ${sale.chickenType}\n` +
    `*Weight:* ${formatWeight(sale.weight)}\n` +
    `*Rate:* ${formatCurrency(sale.sellingRate)}/KG\n` +
    `---------------------------------\n` +
    `*Subtotal:* ${formatCurrency(sale.weight * sale.sellingRate)}\n` +
    `*Discount:* -${formatCurrency(sale.discount)}\n` +
    `*Charges (Packing + Delivery):* ${formatCurrency(sale.packingCharge + sale.deliveryCharge)}\n` +
    `*GST (${sale.gst}%):* ${formatCurrency((((sale.weight * sale.sellingRate) - sale.discount) * sale.gst) / 100)}\n` +
    `---------------------------------\n` +
    `*Grand Total: ${formatCurrency(sale.totalAmount)}*\n` +
    `---------------------------------\n` +
    `*Payment Mode:* ${sale.paymentType}\n` +
    `Thank you for your business!`
  );
};

/**
 * Generates structured text for WhatsApp sharing of a purchase receipt
 */
export const getPurchaseWhatsAppText = (purchase: Purchase, supplierName: string, companyName: string): string => {
  return encodeURIComponent(
    `*${companyName}*\n` +
    `---------------------------------\n` +
    `*PURCHASE RECEIPT*\n` +
    `---------------------------------\n` +
    `*Receipt No:* ${purchase.purchaseNumber}\n` +
    `*Date:* ${formatDate(purchase.date)}\n` +
    `*Supplier:* ${supplierName}\n` +
    `*Item:* ${purchase.chickenType}\n` +
    `*Weight:* ${formatWeight(purchase.weight)}\n` +
    `*Rate:* ${formatCurrency(purchase.rate)}/KG\n` +
    `---------------------------------\n` +
    `*Grand Total: ${formatCurrency(purchase.totalAmount)}*\n` +
    `---------------------------------\n` +
    `*Payment Mode:* ${purchase.paymentMethod}\n` +
    `Logged successfully in our system.`
  );
};

/**
 * Downloads mock CSV file for data exports.
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => {
    return Object.values(item).map(val => {
      const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape double quotes and wrap in quotes if commas exist
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
