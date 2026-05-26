export const STATUS_LABELS = {
  Pending: 'Σε αναμονή',
  Confirmed: 'Επιβεβαιωμένη',
  Active: 'Ενεργή',
  Completed: 'Ολοκληρωμένη',
  Canceled: 'Ακυρωμένη',
};

export const TIER_LABELS = {
  new: 'Νέο Μέλος',
  silver: 'Αργυρό Μέλος',
  gold: 'Χρυσό Μέλος',
  platinum: 'Platinum Μέλος',
};

export function formatGreekDate(dt) {
  return new Date(dt).toLocaleDateString('el-GR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export function formatGreekDateTime(dt) {
  return new Date(dt).toLocaleString('el-GR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatEUR(amount) {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
}
