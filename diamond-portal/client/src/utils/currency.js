export function formatEUR(amount) {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
}
