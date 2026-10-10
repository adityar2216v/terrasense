export function formatCompactNumber(num: number | undefined | null): string {
  if (num == null) return '--';
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
}

export function formatExactNumber(num: number | undefined | null): string {
  if (num == null) return '--';
  return Intl.NumberFormat('en-US').format(num);
}
