import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { formatDate, formatDateTime } from '../utils/greekDates.js';
import { formatEUR } from '../utils/currency.js';
import { STATUS_LABELS, STATUS_CLASSES } from '../utils/statusColors.js';
import BookingTimeline from '../components/bookings/BookingTimeline.jsx';
import EditBookingModal from '../components/bookings/EditBookingModal.jsx';
import CancelBookingModal from '../components/bookings/CancelBookingModal.jsx';
import ExtendBookingModal from '../components/bookings/ExtendBookingModal.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bookings/${id}`);
      if (data.ok) setBooking(data.booking);
      else setError('Η κράτηση δεν βρέθηκε');
    } catch {
      setError('Δεν ήταν δυνατή η φόρτωση της κράτησης');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) { addToast('Επιλέξτε βαθμολογία', 'warning'); return; }
    setReviewLoading(true);
    try {
      const { data } = await api.post(`/bookings/${id}/review`, { rating: reviewRating, comment: reviewComment });
      if (data.ok) {
        addToast('Η αξιολόγησή σας καταχωρήθηκε! Ευχαριστούμε!', 'success');
        setReviewOpen(false);
        fetchBooking();
      } else {
        addToast(data.message || 'Σφάλμα κατά την αξιολόγηση', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Σφάλμα', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-4">{error || 'Κράτηση δεν βρέθηκε'}</h2>
        <Button onClick={() => navigate('/bookings')} variant="ghost">← Πίσω στις κρατήσεις</Button>
      </div>
    );
  }

  const canEdit = ['Pending', 'Confirmed'].includes(booking.status);
  const canCancel = ['Pending', 'Confirmed'].includes(booking.status);
  const canExtend = ['Active', 'Confirmed'].includes(booking.status);
  const canReview = booking.status === 'Completed' && !booking.review;

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
        >
          ← Πίσω στις κρατήσεις
        </button>

        {/* Header card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASSES[booking.status]}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {booking.vehicle?.make} {booking.vehicle?.model}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{booking.bookingNumber}</p>
              {booking.vehicle?.licensePlate && (
                <p className="text-sm text-gray-500 mt-1">🚗 {booking.vehicle.licensePlate}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-brand-teal">{formatEUR(booking.totalAmount)}</div>
              {booking.vehicle?.category && (
                <div className="text-xs text-gray-400 mt-1">{booking.vehicle.category}</div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <BookingTimeline status={booking.status} />
          </div>
        </div>

        {/* Dates & Locations */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Λεπτομέρειες ταξιδίου</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Παραλαβή</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.pickupLocation || '—'}</div>
              <div className="text-sm text-brand-teal font-medium mt-0.5">{formatDateTime(booking.pickupDateTime)}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Επιστροφή</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.dropoffLocation || booking.pickupLocation || '—'}</div>
              <div className="text-sm text-brand-teal font-medium mt-0.5">{formatDateTime(booking.dropoffDateTime)}</div>
            </div>
          </div>
          {booking.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Σημειώσεις</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Pricing breakdown */}
        {(booking.basePrice || booking.extras?.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Ανάλυση κόστους</h2>
            <div className="space-y-2 text-sm">
              {booking.basePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Βασική χρέωση</span>
                  <span className="font-semibold">{formatEUR(booking.basePrice)}</span>
                </div>
              )}
              {booking.extras?.map((ex, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{ex.name}</span>
                  <span className="font-semibold">{formatEUR(ex.price)}</span>
                </div>
              ))}
              {booking.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Έκπτωση</span>
                  <span>-{formatEUR(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-800 dark:text-gray-200">Σύνολο</span>
                <span className="text-brand-teal">{formatEUR(booking.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Review section */}
        {booking.status === 'Completed' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Αξιολόγηση</h2>
            {booking.review ? (
              <div>
                <StarRating value={booking.review.rating} onChange={() => {}} size="sm" />
                {booking.review.comment && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">"{booking.review.comment}"</p>
                )}
                <p className="text-xs text-gray-400 mt-2">{formatDate(booking.review.createdAt)}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-3">Πώς ήταν η εμπειρία σας;</p>
                <Button onClick={() => setReviewOpen(true)}>⭐ Αξιολογήστε την κράτηση</Button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {(canEdit || canCancel || canExtend) && (
          <div className="flex flex-wrap gap-3">
            {canEdit && <Button variant="outline" onClick={() => setEditOpen(true)}>✏️ Επεξεργασία</Button>}
            {canExtend && <Button variant="outline" onClick={() => setExtendOpen(true)}>⏳ Παράταση</Button>}
            {canCancel && <Button variant="danger" onClick={() => setCancelOpen(true)}>✕ Ακύρωση</Button>}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditBookingModal open={editOpen} onClose={() => setEditOpen(false)} booking={booking} onUpdated={fetchBooking} />
      <CancelBookingModal open={cancelOpen} onClose={() => setCancelOpen(false)} booking={booking} onCanceled={() => { fetchBooking(); navigate('/bookings'); }} />
      <ExtendBookingModal open={extendOpen} onClose={() => setExtendOpen(false)} booking={booking} onUpdated={fetchBooking} />

      {/* Review modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Αξιολόγηση κράτησης">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Σχόλιο (προαιρετικό)</label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={4}
              placeholder="Μοιραστείτε την εμπειρία σας..."
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setReviewOpen(false)} className="flex-1">Άκυρο</Button>
            <Button type="submit" loading={reviewLoading} disabled={!reviewRating} className="flex-1">Υποβολή αξιολόγησης</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
