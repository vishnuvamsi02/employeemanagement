export function formatCurrency(amount: number, symbol: string = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(Math.round(amount * 100) / 100);
  return `${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateString;
}

export function getMonthName(monthStr: string): string {
  // monthStr: YYYY-MM
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
