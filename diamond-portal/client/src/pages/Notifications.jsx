import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { formatDateTime } from '../utils/greekDates.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';

const NOTIF_TYPES = {
  booking_confirmed: { icon: '✅', color: 'border-green-400', label: 'Επιβεβαίωση' },
  booking_canceled: { icon: '❌', color: 'border-red-400', label: 'Ακύρωση' },
  booking_reminder: { icon: '⏰', color: 'border-blue-400', label: 'Υπενθύμιση' },
  payment_received: { icon: '💳', color: 'border-brand-teal', label: 'Πληρωμή' },
  loyalty_points: { icon: '🏆', color: 'border-yellow-400', label: 'Loyalty' },
  support_reply: { icon: '💬', color: 'border-purple-400', label: 'Υποστήριξη' },
  system: { icon: 'ℹ️', color: 'border-gray-300', label: 'Σύστημα' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=50');
      if (data.ok) setNotifications(data.notifications || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('Όλες οι ειδοποιήσεις σημάνθηκαν ως αναγνωσμένες', 'success');
    } catch { addToast('Σφάλμα', 'error'); }
    finally { setMarkingAll(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { addToast('Σφάλμα διαγραφής', 'error'); }
    finally { setDeletingId(null); }
  };

  const handleClick = async (notif) => {
    if (!notif.read) await handleMarkAsRead(notif._id);
    if (notif.linkTo) navigate(notif.linkTo);
    else if (notif.bookingId) navigate(`/bookings/${notif.bookingId}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ειδοποιήσεις</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {unreadCount} νέες
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-brand-teal font-bold hover:text-teal-700 flex items-center gap-1 disabled:opacity-50"
          >
            {markingAll && <span className="w-3 h-3 border border-brand-teal border-t-transparent rounded-full animate-spin" />}
            Διαβάστε όλα
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="Δεν υπάρχουν ειδοποιήσεις" description="Οι ειδοποιήσεις σας θα εμφανιστούν εδώ" />
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const cfg = NOTIF_TYPES[notif.type] || NOTIF_TYPES.system;
            return (
              <div
                key={notif._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border-l-4 ${cfg.color} shadow-sm flex items-start gap-3 cursor-pointer hover:shadow-md transition-all ${
                  !notif.read ? 'border-opacity-100' : 'border-opacity-30 opacity-75'
                }`}
                onClick={() => handleClick(notif)}
              >
                <div className="text-2xl flex-shrink-0">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${!notif.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                    {notif.title || notif.message}
                  </div>
                  {notif.title && notif.message && (
                    <div className="text-xs text-gray-400 mt-0.5">{notif.message}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{formatDateTime(notif.createdAt)}</span>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-teal flex-shrink-0" />}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                  disabled={deletingId === notif._id}
                  className="text-gray-300 hover:text-red-400 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0 text-sm"
                >
                  {deletingId === notif._id ? '...' : '✕'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
