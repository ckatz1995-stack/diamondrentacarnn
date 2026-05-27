import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { toDatetimeLocal, formatDate } from '../../utils/greekDates.js';
import { formatEUR } from '../../utils/currency.js';
import { useToast } from '../../contexts/NotificationContext.jsx';
import api from '../../api/client.js';

export default function ExtendBookingModal({ open, onClose, booking, onUpdated }) {
  const { addToast } = useToast();
  const [newDropoff, setNewDropoff] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const currentDropoff = booking ? toDatetimeLocal(booking.dropoffDateTime) : '';

  const handleCalculate = async () => {
    if (!newDropoff) return;
    setError('');
    try {
      const { data } = await api.post(`/bookings/${booking._id}/extend/preview`, { newDropoffDateTime: newDropoff });
      if (data.ok) setPreview(data);
      else setError(data.message || 'Δεν ήταν δυνατός ο υπολογισμός');
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα κατά τον υπολογισμό');
    }
  };

  const handleExtend = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/bookings/${booking._id}/extend`, { newDropoffDateTime: newDropoff });
      if (data.ok) {
        addToast('Η κράτηση παρατάθηκε επιτυχώς!', 'success');
        onUpdated?.(data.booking);
        onClose();
        setPreview(null);
        setNewDropoff('');
      } else {
        setError(data.message || 'Δεν ήταν δυνατή η παράταση');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα κατά την παράταση');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Παράταση Κράτησης">
      <div className="space-y-4">
        {booking && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm">
            <div className="font-bold text-gray-700 dark:text-gray-200 mb-1">{booking.vehicle?.make} {booking.vehicle?.model}</div>
            <div className="text-gray-500">Τρέχουσα επιστροφή: <strong>{formatDate(booking.dropoffDateTime)}</strong></div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Νέα Ημερομηνία Επιστροφής</label>
          <input
            type="datetime-local"
            value={newDropoff}
            onChange={e => { setNewDropoff(e.target.value); setPreview(null); }}
            min={currentDropoff}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          />
        </div>

        {!preview && newDropoff && (
          <Button variant="outline" onClick={handleCalculate} className="w-full">
            Υπολογισμός κόστους παράτασης
          </Button>
        )}

        {preview && (
          <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-4">
            <div className="text-sm font-bold text-brand-teal mb-2">Κόστος παράτασης</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Επιπλέον ημέρες</span>
                <span className="font-bold">{preview.extraDays} μέρες</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Επιπλέον χρέωση</span>
                <span className="font-bold text-brand-teal">{formatEUR(preview.extraCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-teal/20 pt-1 mt-1">
                <span className="font-bold text-gray-700 dark:text-gray-200">Νέο σύνολο</span>
                <span className="font-black text-brand-teal">{formatEUR(preview.newTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Άκυρο</Button>
          <Button
            loading={loading}
            disabled={!preview}
            onClick={handleExtend}
            className="flex-1"
          >
            Επιβεβαίωση παράτασης
          </Button>
        </div>
      </div>
    </Modal>
  );
}
