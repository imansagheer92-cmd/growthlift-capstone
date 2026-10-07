/**
 * Export expenses to CSV using base64 data URL (works on all browsers).
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
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const encoded = encodeURIComponent(csvContent);
  const dataUri = `data:text/csv;charset=utf-8,${encoded}`;

  const filename = `spendwise-expenses-${new Date().toISOString().split('T')[0]}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', filename);
  link.style.position = 'fixed';
  link.style.top = '0';
  link.style.left = '0';
  link.style.opacity = '0';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
