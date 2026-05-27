import { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { toDatetimeLocal } from '../../utils/greekDates.js';
import { useToast } from '../../contexts/NotificationContext.jsx';
import api from '../../api/client.js';

export default function EditBookingModal({ open, onClose, booking, onUpdated }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ pickupDateTime: '', dropoffDateTime: '', pickupLocation: '', dropoffLocation: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking && open) {
      setForm({
        pickupDateTime: toDatetimeLocal(booking.pickupDateTime),
        dropoffDateTime: toDatetimeLocal(booking.dropoffDateTime),
        pickupLocation: booking.pickupLocation || '',
        dropoffLocation: booking.dropoffLocation || '',
        notes: booking.notes || '',
      });
      setError('');
    }
  }, [booking, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.pickupDateTime || !form.dropoffDateTime) { setError('Επιλέξτε ημερομηνίες'); return; }
    if (new Date(form.dropoffDateTime) <= new Date(form.pickupDateTime)) { setError('Η ημερομηνία επιστροφής πρέπει να είναι μετά την παραλαβή'); return; }
    setLoading(true);
    try {
      const { data } = await api.put(`/bookings/${booking._id}`, form);
      if (data.ok) {
        addToast('Η κράτηση ενημερώθηκε επιτυχώς!', 'success');
        onUpdated?.(data.booking);
        onClose();
      } else {
        setError(data.message || 'Δεν ήταν δυνατή η ενημέρωση');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα κατά την ενημέρωση');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Επεξεργασία Κράτησης" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ημ/νία Παραλαβής</label>
            <input
              type="datetime-local"
              value={form.pickupDateTime}
              onChange={e => setForm(f => ({ ...f, pickupDateTime: e.target.value }))}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ημ/νία Επιστροφής</label>
            <input
              type="datetime-local"
              value={form.dropoffDateTime}
              onChange={e => setForm(f => ({ ...f, dropoffDateTime: e.target.value }))}
              required
              min={form.pickupDateTime}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Τοποθεσία Παραλαβής</label>
          <input
            type="text"
            value={form.pickupLocation}
            onChange={e => setForm(f => ({ ...f, pickupLocation: e.target.value }))}
            placeholder="π.χ. Αεροδρόμιο Νικολάου Καζαντζάκη"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Τοποθεσία Επιστροφής</label>
          <input
            type="text"
            value={form.dropoffLocation}
            onChange={e => setForm(f => ({ ...f, dropoffLocation: e.target.value }))}
            placeholder="π.χ. Λιμάνι Ηρακλείου"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Σημειώσεις</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Ειδικές απαιτήσεις ή σημειώσεις..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Άκυρο</Button>
          <Button type="submit" loading={loading} className="flex-1">Αποθήκευση αλλαγών</Button>
        </div>
      </form>
    </Modal>
  );
}
