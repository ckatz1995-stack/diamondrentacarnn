import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../../contexts/NotificationContext.jsx';
import api from '../../api/client.js';

export default function SecondaryDriverModal({ open, onClose, onAdded }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ firstName: '', lastName: '', licenseNumber: '', nationality: '', age: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setError('Συμπληρώστε όνομα και επώνυμο'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/profile/secondary-drivers', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        licenseNumber: form.licenseNumber.trim(),
        nationality: form.nationality.trim(),
        age: form.age ? Number(form.age) : undefined,
      });
      if (data.ok) {
        addToast('Δευτερεύων οδηγός προστέθηκε!', 'success');
        onAdded?.();
        onClose();
        setForm({ firstName: '', lastName: '', licenseNumber: '', nationality: '', age: '' });
      } else {
        setError(data.message || 'Σφάλμα κατά την προσθήκη');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα σύνδεσης');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Προσθήκη Δευτερεύοντα Οδηγού">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Όνομα *</label>
            <input type="text" value={form.firstName} onChange={set('firstName')} required placeholder="Μαρία"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Επώνυμο *</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} required placeholder="Παπαδοπούλου"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Αριθμός Άδειας Οδήγησης</label>
          <input type="text" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="ΑΒ 123456"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Εθνικότητα</label>
            <input type="text" value={form.nationality} onChange={set('nationality')} placeholder="Ελληνική"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ηλικία</label>
            <input type="number" value={form.age} onChange={set('age')} min="18" max="100" placeholder="28"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Άκυρο</Button>
          <Button type="submit" loading={loading} className="flex-1">Προσθήκη οδηγού</Button>
        </div>
      </form>
    </Modal>
  );
}
