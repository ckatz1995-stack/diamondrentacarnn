export function hoursUntil(dt) {
  return (new Date(dt) - new Date()) / 3600000;
}

export function cancellationPolicy(pickupDateTime) {
  const h = hoursUntil(pickupDateTime);
  if (h <= 0) return { canCancel: false, refundPct: 0, label: 'Δεν επιτρέπεται ακύρωση' };
  if (h <= 24) return { canCancel: true, refundPct: 0, label: 'Χωρίς επιστροφή χρημάτων' };
  if (h <= 48) return { canCancel: true, refundPct: 50, label: 'Επιστροφή 50%' };
  return { canCancel: true, refundPct: 100, label: 'Πλήρης επιστροφή χρημάτων' };
}
