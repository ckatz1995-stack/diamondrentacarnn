import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import api from '../../api/client.js';
import { useToast } from '../../contexts/NotificationContext.jsx';

const INSURANCE_OPTIONS = ['Βασική', 'Πλήρης', 'Premium', 'CDW', 'SCDW'];
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Active'];
const STATUS_LABELS = { Pending: 'Σε αναμονή', Confirmed: 'Επιβεβαιωμένη', Active: 'Ενεργή' };

const EMPTY = {
  customerEmail: '',
  customerName: '',
  customerPhone: '',
  vehicleName: '',
  pickupDateTime: '',
  dropoffDateTime: '',
  pickupLocation: '',
  dropoffLocation: '',
  totalPrice: '',
  insurance: '',
  driverAge: '',
  notes: '',
  status: 'Pending',
};

export default function CreateBookingModal({ open, onClose, onCreated }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.vehicleName.trim()) e.vehicleName = 'Απαιτείται όνομα οχήματος';
    if (!form.pickupDateTime) e.pickupDateTime = 'Απαιτείται ημ/νία παραλαβής';
    if (!form.dropoffDateTime) e.dropoffDateTime = 'Απαιτείται ημ/νία επιστροφής';
    if (form.pickupDateTime && form.dropoffDateTime && form.dropoffDateTime <= form.pickupDateTime)
      e.dropoffDateTime = 'Η επιστροφή πρέπει να είναι μετά την παραλαβή';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        totalPrice: form.totalPrice !== '' ? Number(form.totalPrice) : 0,
        pickupDateTime: new Date(form.pickupDateTime).toISOString(),
        dropoffDateTime: new Date(form.dropoffDateTime).toISOString(),
      };
      // remove empty strings
      Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });

      const { data } = await api.post('/admin/bookings', payload);
      if (data.ok) {
        addToast(`Κράτηση ${data.booking.bookingNumber} δημιουργήθηκε`, 'success');
        setForm(EMPTY);
        onCreated?.();
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Σφάλμα δημιουργίας κράτησης', 'error');
    } finally { setSaving(false); }
  };

  const handleClose = () => { setForm(EMPTY); setErrors({}); onClose(); };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white dark:border-gray-600 ${err ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`;

  return (
    <Modal open={open} onClose={handleClose} title="Νέα Κράτηση">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Customer info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email πελάτη" error={errors.customerEmail}>
            <input
              type="email"
              value={form.customerEmail}
              onChange={e => set('customerEmail', e.target.value)}
              placeholder="customer@email.com"
              className={inputCls(errors.customerEmail)}
            />
          </Field>
          <Field label="Ονοματεπώνυμο" error={errors.customerName}>
            <input
              value={form.customerName}
              onChange={e => set('customerName', e.target.value)}
              placeholder="Γιάννης Παπαδόπουλος"
              className={inputCls(errors.customerName)}
            />
          </Field>
          <Field label="Τηλέφωνο">
            <input
              type="tel"
              value={form.customerPhone}
              onChange={e => set('customerPhone', e.target.value)}
              placeholder="+30 6912 345678"
              className={inputCls()}
            />
          </Field>
          <Field label="Ηλικία οδηγού">
            <input
              value={form.driverAge}
              onChange={e => set('driverAge', e.target.value)}
              placeholder="25-65"
              className={inputCls()}
            />
          </Field>
        </div>

        {/* Vehicle */}
        <Field label="Όχημα *" error={errors.vehicleName}>
          <input
            value={form.vehicleName}
            onChange={e => set('vehicleName', e.target.value)}
            placeholder="π.χ. Toyota Yaris, Volkswagen Polo..."
            className={inputCls(errors.vehicleName)}
          />
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Παραλαβή *" error={errors.pickupDateTime}>
            <input
              type="datetime-local"
              value={form.pickupDateTime}
              onChange={e => set('pickupDateTime', e.target.value)}
              className={inputCls(errors.pickupDateTime)}
            />
          </Field>
          <Field label="Επιστροφή *" error={errors.dropoffDateTime}>
            <input
              type="datetime-local"
              value={form.dropoffDateTime}
              onChange={e => set('dropoffDateTime', e.target.value)}
              className={inputCls(errors.dropoffDateTime)}
            />
          </Field>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Τοποθεσία παραλαβής">
            <input
              value={form.pickupLocation}
              onChange={e => set('pickupLocation', e.target.value)}
              placeholder="π.χ. Αεροδρόμιο ΜΑΚ"
              className={inputCls()}
            />
          </Field>
          <Field label="Τοποθεσία επιστροφής">
            <input
              value={form.dropoffLocation}
              onChange={e => set('dropoffLocation', e.target.value)}
              placeholder="π.χ. Γραφείο Θεσσαλονίκη"
              className={inputCls()}
            />
          </Field>
        </div>

        {/* Price, insurance, status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Συνολικό ποσό (€)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.totalPrice}
              onChange={e => set('totalPrice', e.target.value)}
              placeholder="0.00"
              className={inputCls()}
            />
          </Field>
          <Field label="Ασφάλεια">
            <select
              value={form.insurance}
              onChange={e => set('insurance', e.target.value)}
              className={inputCls()}
            >
              <option value="">— Επιλογή —</option>
              {INSURANCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Κατάσταση">
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className={inputCls()}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </Field>
        </div>

        {/* Notes */}
        <Field label="Σημειώσεις">
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={2}
            placeholder="Σημειώσεις για την κράτηση..."
            className={inputCls()}
          />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Ακύρωση
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-teal rounded-xl hover:bg-brand-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Αποθήκευση...' : 'Δημιουργία κράτησης'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
