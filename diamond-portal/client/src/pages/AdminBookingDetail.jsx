import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';
import { formatDate, formatDateTime } from '../utils/greekDates.js';
import { formatEUR } from '../utils/currency.js';
import { STATUS_LABELS, STATUS_CLASSES, TIER_LABELS, TIER_CLASSES } from '../utils/statusColors.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import BookingTimeline from '../components/bookings/BookingTimeline.jsx';
import Button from '../components/ui/Button.jsx';
import api from '../api/client.js';

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  if (user && user.role !== 'admin') {
    navigate('/bookings', { replace: true });
    return null;
  }

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/bookings/${id}`);
      if (data.ok) {
        setBooking(data.booking);
        setStaffNotes(data.booking.staffNotes || '');
        setReview(data.review || null);
      } else {
        setError('Η κράτηση δεν βρέθηκε');
      }
    } catch {
      setError('Δεν ήταν δυνατή η φόρτωση της κράτησης');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(newStatus);
    try {
      const { data } = await api.patch(`/admin/bookings/${id}`, { status: newStatus });
      if (data.ok) {
        addToast('Status κράτησης ενημερώθηκε', 'success');
        setBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      addToast('Σφάλμα κατά την ενημέρωση', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async () => {
    setNotesLoading(true);
    try {
      const { data } = await api.patch(`/admin/bookings/${id}`, { staffNotes });
      if (data.ok) addToast('Οι σημειώσεις αποθηκεύτηκαν', 'success');
    } catch {
      addToast('Σφάλμα κατά την αποθήκευση', 'error');
    } finally {
      setNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-4">{error || 'Κράτηση δεν βρέθηκε'}</h2>
        <button onClick={() => navigate('/admin')} className="text-brand-teal font-medium">← Πίσω στη διαχείριση</button>
      </div>
    );
  }

  const member = booking.memberId;
  const isPending = booking.status === 'Pending';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
      >
        ← Πίσω στη διαχείριση
      </button>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASSES[booking.status]}`}>
                {STATUS_LABELS[booking.status]}
              </span>
              <span className="text-xs text-gray-400 font-mono">{booking.bookingNumber}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {booking.vehicleName || '—'}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {formatDateTime(booking.pickupDateTime)} → {formatDateTime(booking.dropoffDateTime)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-brand-teal">{formatEUR(booking.totalPrice)}</div>
            {booking.insurance && (
              <div className="text-xs text-gray-400 mt-1">Ασφάλεια: {booking.insurance}</div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <BookingTimeline status={booking.status} />
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-wrap">
          {isPending ? (
            <>
              <button
                disabled={actionLoading === 'Confirmed'}
                onClick={() => handleStatusChange('Confirmed')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {actionLoading === 'Confirmed' ? '…' : '✓ Επιβεβαίωση κράτησης'}
              </button>
              <button
                disabled={actionLoading === 'Canceled'}
                onClick={() => handleStatusChange('Canceled')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {actionLoading === 'Canceled' ? '…' : '✕ Ακύρωση'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Αλλαγή status:</span>
              <select
                value={booking.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={!!actionLoading}
                className="text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
              >
                {['Pending', 'Confirmed', 'Active', 'Completed', 'Canceled'].map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Member info */}
      {member && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Στοιχεία Μέλους</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ονοματεπώνυμο</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{member.firstName} {member.lastName}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
              <div className="text-gray-600 dark:text-gray-400 break-all">{member.email}</div>
            </div>
            {member.phone && (
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Τηλέφωνο</div>
                <div className="text-gray-600 dark:text-gray-400">{member.phone}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Επίπεδο</div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_CLASSES[member.loyaltyTier || 'new']}`}>
                {TIER_LABELS[member.loyaltyTier || 'new']}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ολοκληρωμένες Ενοικιάσεις</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{member.totalCompletedRentals || 0}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Loyalty Points</div>
              <div className="font-semibold text-brand-teal">{member.loyaltyPoints || 0} pts</div>
            </div>
          </div>
        </div>
      )}

      {/* Trip details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Λεπτομέρειες Ενοικίασης</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Παραλαβή</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.pickupLocation || '—'}</div>
            <div className="text-brand-teal font-medium mt-0.5">{formatDateTime(booking.pickupDateTime)}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Επιστροφή</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.dropoffLocation || booking.pickupLocation || '—'}</div>
            <div className="text-brand-teal font-medium mt-0.5">{formatDateTime(booking.dropoffDateTime)}</div>
          </div>
          {booking.insurance && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ασφάλεια</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.insurance}</div>
            </div>
          )}
          {booking.driverAge && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ηλικία Οδηγού</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.driverAge}</div>
            </div>
          )}
        </div>

        {booking.extras?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Πρόσθετα</div>
            <div className="space-y-1.5">
              {booking.extras.map((ex, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{ex.name}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formatEUR(ex.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {booking.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Σημειώσεις Πελάτη</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Κόστος</h2>
        <div className="space-y-2 text-sm">
          {booking.extras?.map((ex, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-gray-500">{ex.name}</span>
              <span>{formatEUR(ex.price)}</span>
            </div>
          ))}
          {booking.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Έκπτωση{booking.promoCode ? ` (${booking.promoCode})` : ''}</span>
              <span>-{formatEUR(booking.discountAmount)}</span>
            </div>
          )}
          {booking.loyaltyPointsEarned > 0 && (
            <div className="flex justify-between text-xs text-brand-teal">
              <span>Πόντοι loyalty</span>
              <span>+{booking.loyaltyPointsEarned} pts</span>
            </div>
          )}
          <div className="flex justify-between font-black text-base pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-gray-800 dark:text-gray-200">Σύνολο</span>
            <span className="text-brand-teal">{formatEUR(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Staff notes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-1">Σημειώσεις Προσωπικού</h2>
        <p className="text-xs text-gray-400 mb-3">Εσωτερικές σημειώσεις — δεν εμφανίζονται στον πελάτη</p>
        <textarea
          value={staffNotes}
          onChange={e => setStaffNotes(e.target.value)}
          rows={4}
          placeholder="π.χ. Ο πελάτης ζήτησε παραλαβή στο αεροδρόμιο. Ειδικές οδηγίες..."
          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white resize-none"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={handleSaveNotes} loading={notesLoading} size="sm">
            Αποθήκευση σημειώσεων
          </Button>
        </div>
      </div>

      {/* Review */}
      {review && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Αξιολόγηση Πελάτη</h2>
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`text-xl ${n <= review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}>★</span>
            ))}
            <span className="text-sm font-bold text-gray-500 ml-2">{review.rating}/5</span>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{review.comment}"</p>
          )}
          <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
          {review.staffResponse && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Απάντηση Προσωπικού</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{review.staffResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
