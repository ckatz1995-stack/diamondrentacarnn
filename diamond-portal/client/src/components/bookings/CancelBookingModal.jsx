import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../../contexts/NotificationContext.jsx';
import api from '../../api/client.js';

export default function CancelBookingModal({ open, onClose, booking, onCanceled }) {
  const { addToast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const REASONS = [
    'Αλλαγή σχεδίων',
    'Βρήκα καλύτερη τιμή αλλού',
    'Ακυρώθηκε το ταξίδι μου',
    'Πρόβλημα με την κράτηση',
    'Άλλος λόγος',
  ];

  const handleCancel = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/bookings/${booking._id}/cancel`, { reason });
      if (data.ok) {
        addToast('Η κράτηση ακυρώθηκε επιτυχώς', 'success');
        onCanceled?.();
        onClose();
      } else {
        setError(data.message || 'Δεν ήταν δυνατή η ακύρωση');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα κατά την ακύρωση');
    } finally {
      setLoading(false);
    }
  };

  const daysUntil = booking ? Math.floor((new Date(booking.pickupDateTime) - new Date()) / 86400000) : 0;
  const freeCancellation = daysUntil >= 2;

  return (
    <Modal open={open} onClose={onClose} title="Ακύρωση Κράτησης">
      <div className="space-y-4">
        {/* Policy notice */}
        <div className={`rounded-xl p-4 ${freeCancellation ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{freeCancellation ? '✅' : '⚠️'}</span>
            <div>
              <div className={`font-bold text-sm ${freeCancellation ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {freeCancellation ? 'Δωρεάν ακύρωση' : 'Πιθανή χρέωση ακύρωσης'}
              </div>
              <p className={`text-sm mt-1 ${freeCancellation ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {freeCancellation
                  ? `Η ακύρωση είναι δωρεάν (${daysUntil} μέρες πριν την παραλαβή)`
                  : daysUntil >= 0
                    ? `Η παραλαβή είναι σε ${daysUntil} ${daysUntil === 1 ? 'μέρα' : 'μέρες'}. Ενδέχεται να υπάρχει χρέωση ακύρωσης.`
                    : 'Η κράτηση έχει ήδη ξεκινήσει.'}
              </p>
            </div>
          </div>
        </div>

        {/* Booking info */}
        {booking && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{booking.vehicle?.make} {booking.vehicle?.model}</div>
            <div className="text-xs text-gray-500">{booking.bookingNumber}</div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Λόγος ακύρωσης (προαιρετικό)</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          >
            <option value="">Επιλέξτε λόγο...</option>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Πίσω</Button>
          <Button variant="danger" loading={loading} onClick={handleCancel} className="flex-1">
            Ακύρωση κράτησης
          </Button>
        </div>
      </div>
    </Modal>
  );
}
