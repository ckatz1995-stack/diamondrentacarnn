import { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../../contexts/NotificationContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';

export default function EditProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', nationality: '', dateOfBirth: '', age: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && open) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        nationality: user.driverProfile?.nationality || '',
        dateOfBirth: user.driverProfile?.dateOfBirth ? user.driverProfile.dateOfBirth.slice(0, 10) : '',
        age: user.driverProfile?.age || '',
      });
      setError('');
    }
  }, [user, open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.put('/profile', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        driverProfile: {
          nationality: form.nationality.trim(),
          dateOfBirth: form.dateOfBirth || undefined,
          age: form.age ? Number(form.age) : undefined,
        },
      });
      if (data.ok) {
        updateUser(data.profile || { firstName: form.firstName, lastName: form.lastName, phone: form.phone });
        addToast('Το προφίλ ενημερώθηκε!', 'success');
        onClose();
      } else {
        setError(data.message || 'Σφάλμα κατά την αποθήκευση');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα σύνδεσης');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Επεξεργασία Προφίλ" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Όνομα</label>
            <input type="text" value={form.firstName} onChange={set('firstName')} required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Επώνυμο</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Τηλέφωνο</label>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+30 69X XXX XXXX"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">Στοιχεία Οδηγού</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Εθνικότητα</label>
              <input type="text" value={form.nationality} onChange={set('nationality')} placeholder="Ελληνική"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ηλικία</label>
              <input type="number" value={form.age} onChange={set('age')} min="18" max="100" placeholder="30"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ημερομηνία Γέννησης</label>
            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Άκυρο</Button>
          <Button type="submit" loading={loading} className="flex-1">Αποθήκευση</Button>
        </div>
      </form>
    </Modal>
  );
}
