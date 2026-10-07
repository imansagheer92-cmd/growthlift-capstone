/**
 * Export an array of expense objects to a CSV file download.
 */
export function exportToCSV(expenses) {
  if (!expenses || expenses.length === 0) return;

  const headers = ['Title', 'Amount (PKR)', 'Category', 'Date', 'Notes'];

  const rows = expenses.map((e) => [
    `"${e.title.replace(/"/g, '""')}"`,
    e.amount,
    `"${e.category}"`,
    new Date(e.date).toLocaleDateString('en-GB'),
    `"${(e.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spendwise-expenses-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
