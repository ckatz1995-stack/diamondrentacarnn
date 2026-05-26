import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../../contexts/NotificationContext.jsx';
import api from '../../api/client.js';

const CATEGORIES = [
  'Ερώτηση για κράτηση',
  'Ακύρωση / επιστροφή χρημάτων',
  'Πρόβλημα με όχημα',
  'Τιμολόγιο / χρέωση',
  'Πρόγραμμα Loyalty',
  'Τεχνικό πρόβλημα',
  'Άλλο',
];

export default function ContactForm({ open, onClose, onCreated }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ subject: '', category: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) { setError('Συμπληρώστε θέμα και μήνυμα'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/support/tickets', form);
      if (data.ok) {
        addToast('Το αίτημά σας στάλθηκε επιτυχώς!', 'success');
        setForm({ subject: '', category: '', message: '' });
        onCreated?.(data.ticket);
        onClose();
      } else {
        setError(data.message || 'Σφάλμα αποστολής');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα σύνδεσης');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Νέο Αίτημα Υποστήριξης" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Κατηγορία</label>
          <select
            value={form.category}
            onChange={set('category')}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          >
            <option value="">Επιλέξτε κατηγορία...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Θέμα *</label>
          <input
            type="text"
            value={form.subject}
            onChange={set('subject')}
            required
            placeholder="Συνοπτική περιγραφή του προβλήματος"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Μήνυμα *</label>
          <textarea
            value={form.message}
            onChange={set('message')}
            required
            rows={5}
            placeholder="Περιγράψτε αναλυτικά το αίτημά σας..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Άκυρο</Button>
          <Button type="submit" loading={loading} className="flex-1">Αποστολή αιτήματος</Button>
        </div>
      </form>
    </Modal>
  );
}
