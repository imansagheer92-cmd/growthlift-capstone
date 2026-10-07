/**
 * Export an array of expense objects to a CSV file download.
 */
export function exportToCSV(expenses) {
  if (!expenses || expenses.length === 0) return;

  const headers = ['Title', 'Amount (PKR)', 'Category', 'Date', 'Notes'];

  const rows = expenses.map((e) => [
    `"${String(e.title).replace(/"/g, '""')}"`,
    e.amount,
    `"${e.category}"`,
    new Date(e.date).toLocaleDateString('en-GB'),
    `"${String(e.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' + // BOM for Excel UTF-8 support
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Use msSaveBlob for IE/Edge legacy, otherwise use anchor download
  if (window.navigator && window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, `spendwise-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `spendwise-expenses-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
