import { useState, useRef } from 'react';
import Button from '../ui/Button.jsx';
import { useToast } from '../../contexts/NotificationContext.jsx';
import { formatDate } from '../../utils/greekDates.js';
import api from '../../api/client.js';

export default function LicenseUpload({ profile, onUpdated }) {
  const { addToast } = useToast();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [licenseForm, setLicenseForm] = useState({
    licenseNumber: profile?.driverProfile?.licenseNumber || '',
    licenseExpiry: profile?.driverProfile?.licenseExpiry ? profile.driverProfile.licenseExpiry.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { addToast('Το αρχείο είναι πολύ μεγάλο (μέγιστο 5MB)', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      addToast('Μη αποδεκτός τύπος αρχείου (JPG, PNG, PDF)', 'error'); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('license', file);
      const { data } = await api.post('/profile/license-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.ok) {
        addToast('Η άδεια ανέβηκε επιτυχώς!', 'success');
        onUpdated?.();
      } else {
        addToast(data.message || 'Σφάλμα κατά το ανέβασμα', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Σφάλμα ανεβάσματος', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSaveLicense = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/profile', {
        driverProfile: {
          licenseNumber: licenseForm.licenseNumber,
          licenseExpiry: licenseForm.licenseExpiry || undefined,
        },
      });
      if (data.ok) {
        addToast('Στοιχεία άδειας αποθηκεύτηκαν!', 'success');
        onUpdated?.();
      } else {
        addToast(data.message || 'Σφάλμα αποθήκευσης', 'error');
      }
    } catch {
      addToast('Σφάλμα αποθήκευσης', 'error');
    } finally {
      setSaving(false);
    }
  };

  const licenseUrl = profile?.driverProfile?.licensePhotoUrl;
  const expiry = profile?.driverProfile?.licenseExpiry;
  const isExpired = expiry && new Date(expiry) < new Date();
  const expiresSOon = expiry && !isExpired && (new Date(expiry) - new Date()) < 90 * 86400000;

  return (
    <div className="space-y-4">
      {/* License number & expiry */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Αριθμός Άδειας</label>
          <input
            type="text"
            value={licenseForm.licenseNumber}
            onChange={e => setLicenseForm(f => ({ ...f, licenseNumber: e.target.value }))}
            placeholder="π.χ. ΑΒ 123456"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ημ/νία Λήξης</label>
          <input
            type="date"
            value={licenseForm.licenseExpiry}
            onChange={e => setLicenseForm(f => ({ ...f, licenseExpiry: e.target.value }))}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white ${
              isExpired ? 'border-red-400' : expiresSOon ? 'border-yellow-400' : 'border-gray-200 dark:border-gray-600'
            }`}
          />
          {isExpired && <p className="text-red-500 text-xs mt-1">⚠️ Η άδεια έχει λήξει!</p>}
          {expiresSOon && !isExpired && <p className="text-yellow-600 text-xs mt-1">⚠️ Λήγει σύντομα ({formatDate(expiry)})</p>}
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={handleSaveLicense} loading={saving}>
        Αποθήκευση στοιχείων άδειας
      </Button>

      {/* Photo upload */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Φωτογραφία Άδειας</div>
        {licenseUrl ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <span className="text-2xl">📄</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-green-700 dark:text-green-400">Άδεια ανεβασμένη</div>
              <a href={licenseUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 underline">Προβολή</a>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Αντικατάσταση
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-brand-teal transition-colors"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Ανέβασμα...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Ανεβάστε φωτογραφία άδειας</div>
                <div className="text-xs text-gray-400 mt-1">JPG, PNG ή PDF — μέχρι 5MB</div>
              </>
            )}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
      </div>
    </div>
  );
}
