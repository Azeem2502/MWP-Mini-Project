// Format amount into Indian Rupee (₹) format
export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol}0`;
  }
  const numericAmount = Number(amount);
  return `${currencySymbol}${numericAmount.toLocaleString('en-IN')}`;
};

// Format date into human-readable string (e.g. 14 Oct 2026)
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format date for <input type="date" /> (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Export an array of transaction objects as CSV
export const exportTransactionsToCSV = (transactions, filename = 'expense-tracker-transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  const headers = ['Title', 'Type', 'Category', 'Amount (INR)', 'Date', 'Payment Method', 'Description'];

  const rows = transactions.map((t) => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.type || ''}"`,
    `"${t.category || ''}"`,
    Number(t.amount || 0),
    `"${formatDate(t.date)}"`,
    `"${t.paymentMethod || ''}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
