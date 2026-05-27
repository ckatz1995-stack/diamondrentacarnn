import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';
import { TIER_LABELS, TIER_CLASSES } from '../utils/statusColors.js';
import { formatDate } from '../utils/greekDates.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import Button from '../components/ui/Button.jsx';
import EditProfileModal from '../components/profile/EditProfileModal.jsx';
import LicenseUpload from '../components/profile/LicenseUpload.jsx';
import SecondaryDriverModal from '../components/profile/SecondaryDriverModal.jsx';
import api from '../api/client.js';

function initials(u) {
  if (!u) return '?';
  return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || u.email?.[0]?.toUpperCase() || '?';
}

export default function Profile() {
  const { user, loadUser } = useAuth();
  const { addToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPreferences || { email: true, sms: false, push: false });
  const [notifSaving, setNotifSaving] = useState(false);
  const [removingDriver, setRemovingDriver] = useState(null);

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword.length < 8) { setPwError('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Οι κωδικοί δεν ταιριάζουν'); return; }
    setPwLoading(true);
    try {
      const { data } = await api.put('/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (data.ok) {
        addToast('Ο κωδικός άλλαξε επιτυχώς!', 'success');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwError(data.message || 'Λανθασμένος τρέχων κωδικός');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Σφάλμα αλλαγής κωδικού');
    } finally {
      setPwLoading(false);
    }
  };

  const handleNotifSave = async () => {
    setNotifSaving(true);
    try {
      const { data } = await api.put('/profile/notifications', { notificationPreferences: notifPrefs });
      if (data.ok) addToast('Προτιμήσεις αποθηκεύτηκαν!', 'success');
    } catch { addToast('Σφάλμα αποθήκευσης', 'error'); }
    finally { setNotifSaving(false); }
  };

  const handleRemoveDriver = async (driverId) => {
    setRemovingDriver(driverId);
    try {
      const { data } = await api.delete(`/profile/secondary-drivers/${driverId}`);
      if (data.ok) { addToast('Ο οδηγός αφαιρέθηκε', 'success'); loadUser(); }
      else addToast(data.message || 'Σφάλμα', 'error');
    } catch { addToast('Σφάλμα αφαίρεσης', 'error'); }
    finally { setRemovingDriver(null); }
  };

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );

  const tier = user.loyalty?.tier || 'new';
  const secondaryDrivers = user.secondaryDrivers || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Προφίλ</h1>

      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-brand-teal flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
            {initials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Μέλος'}
                </h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
                {user.phone && <p className="text-gray-500 text-sm mt-0.5">📞 {user.phone}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>✏️ Επεξεργασία</Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TIER_CLASSES[tier]}`}>
                {TIER_LABELS[tier]}
              </span>
              {user.loyalty?.points > 0 && (
                <span className="text-xs text-gray-400">{user.loyalty.points} πόντοι</span>
              )}
            </div>
            {user.emailVerified === false && (
              <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-1.5 text-xs text-yellow-700 dark:text-yellow-400">
                ⚠️ Το email δεν έχει επαληθευτεί
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Driver info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Στοιχεία Οδηγού</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ηλικία</div>
            <div className="font-medium text-gray-800 dark:text-gray-200">{user.driverProfile?.age || '—'} ετών</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Εθνικότητα</div>
            <div className="font-medium text-gray-800 dark:text-gray-200">{user.driverProfile?.nationality || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Αριθμός Άδειας</div>
            <div className="font-medium text-gray-800 dark:text-gray-200">{user.driverProfile?.licenseNumber || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Λήξη Άδειας</div>
            <div className="font-medium text-gray-800 dark:text-gray-200">{formatDate(user.driverProfile?.licenseExpiry) || '—'}</div>
          </div>
        </div>

        {/* License upload */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <LicenseUpload profile={user} onUpdated={loadUser} />
        </div>
      </div>

      {/* Secondary drivers */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Δευτερεύοντες Οδηγοί</h3>
          <Button size="sm" variant="outline" onClick={() => setDriverModalOpen(true)}>+ Προσθήκη</Button>
        </div>
        {secondaryDrivers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Δεν έχετε προσθέσει δευτερεύοντες οδηγούς</p>
        ) : (
          <div className="space-y-3">
            {secondaryDrivers.map(driver => (
              <div key={driver._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                    {driver.firstName} {driver.lastName}
                  </div>
                  {driver.licenseNumber && <div className="text-xs text-gray-400">Άδεια: {driver.licenseNumber}</div>}
                  {driver.nationality && <div className="text-xs text-gray-400">{driver.nationality}</div>}
                </div>
                <button
                  onClick={() => handleRemoveDriver(driver._id)}
                  disabled={removingDriver === driver._id}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  {removingDriver === driver._id ? '...' : '✕'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password change */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Αλλαγή Κωδικού</h3>
        {pwError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            ⚠️ {pwError}
          </div>
        )}
        <form onSubmit={handlePwSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Τρέχων κωδικός</label>
            <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Νέος κωδικός</label>
            <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required
              placeholder="Τουλάχιστον 8 χαρακτήρες"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Επιβεβαίωση νέου κωδικού</label>
            <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white" />
          </div>
          <Button type="submit" loading={pwLoading} size="md">Αλλαγή κωδικού</Button>
        </form>
      </div>

      {/* Notification preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Προτιμήσεις Ειδοποιήσεων</h3>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email ειδοποιήσεις', desc: 'Λαμβάνετε ειδοποιήσεις στο email σας' },
            { key: 'sms', label: 'SMS ειδοποιήσεις', desc: 'Λαμβάνετε SMS στο κινητό σας' },
            { key: 'push', label: 'Push ειδοποιήσεις', desc: 'Ειδοποιήσεις στον browser' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pref.label}</div>
                <div className="text-xs text-gray-400">{pref.desc}</div>
              </div>
              <button
                onClick={() => setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifPrefs[pref.key] ? 'bg-brand-teal' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifPrefs[pref.key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={handleNotifSave} loading={notifSaving} className="mt-4">
          Αποθήκευση προτιμήσεων
        </Button>
      </div>

      {/* Modals */}
      <EditProfileModal open={editOpen} onClose={() => { setEditOpen(false); loadUser(); }} />
      <SecondaryDriverModal open={driverModalOpen} onClose={() => setDriverModalOpen(false)} onAdded={loadUser} />
    </div>
  );
}
