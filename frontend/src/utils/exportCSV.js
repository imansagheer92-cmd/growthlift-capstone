/**
 * Export expenses to CSV.
 * Uses Blob + object URL with a same-page anchor click.
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
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const filename = `spendwise-expenses-${new Date().toISOString().split('T')[0]}.csv`;

  try {
    // Method 1: Blob + object URL
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
  } catch {
    // Method 2: open in new tab as fallback
    const encoded = encodeURIComponent(csvContent);
    window.open(`data:text/csv;charset=utf-8,${encoded}`, '_blank');
  }
}
