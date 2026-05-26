export function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('el-GR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDateShort(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 16);
}

export function countdown(dt) {
  const diff = new Date(dt) - new Date();
  if (diff <= 0) return 'Σήμερα!';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days === 0) return hours <= 1 ? 'Σε λίγο!' : `σε ${hours} ώρες`;
  if (days === 1) return 'Αύριο!';
  return `σε ${days} μέρες`;
}
