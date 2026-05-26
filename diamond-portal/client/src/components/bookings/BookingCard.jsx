import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATUS_LABELS, STATUS_CLASSES } from '../../utils/statusColors.js';
import { formatDateShort, countdown } from '../../utils/greekDates.js';
import { formatEUR } from '../../utils/currency.js';
import BookingTimeline from './BookingTimeline.jsx';
import EditBookingModal from './EditBookingModal.jsx';
import CancelBookingModal from './CancelBookingModal.jsx';
import ExtendBookingModal from './ExtendBookingModal.jsx';
import Button from '../ui/Button.jsx';

export default function BookingCard({ booking, onUpdated }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);

  const canEdit = ['Pending', 'Confirmed'].includes(booking.status);
  const canCancel = ['Pending', 'Confirmed'].includes(booking.status);
  const canExtend = ['Active', 'Confirmed'].includes(booking.status);
  const isUpcoming = ['Pending', 'Confirmed'].includes(booking.status);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
        {/* Card header */}
        <div
          className="p-5 cursor-pointer select-none"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASSES[booking.status]}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
                {isUpcoming && (
                  <span className="bg-brand-teal/10 text-brand-teal text-xs font-bold px-2 py-0.5 rounded-full">
                    {countdown(booking.pickupDateTime)}
                  </span>
                )}
              </div>
              <h3 className="font-black text-gray-900 dark:text-white text-base">
                {booking.vehicle?.make} {booking.vehicle?.model}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{booking.bookingNumber}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-black text-brand-teal text-lg">{formatEUR(booking.totalAmount)}</div>
              <div className="text-xs text-gray-400 mt-1">
                {formatDateShort(booking.pickupDateTime)} — {formatDateShort(booking.dropoffDateTime)}
              </div>
              <div className="text-gray-300 dark:text-gray-600 text-xs mt-1">{expanded ? '▲' : '▼'}</div>
            </div>
          </div>

          {/* Quick info row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
            <span>📍 {booking.pickupLocation || '—'}</span>
            {booking.vehicle?.licensePlate && <span>🚗 {booking.vehicle.licensePlate}</span>}
            {booking.vehicle?.category && <span>🏷️ {booking.vehicle.category}</span>}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            {/* Timeline */}
            <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/30">
              <BookingTimeline status={booking.status} />
            </div>

            {/* Details grid */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Παραλαβή</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">{booking.pickupLocation || '—'}</div>
                <div className="text-xs text-gray-400">{formatDateShort(booking.pickupDateTime)}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Επιστροφή</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">{booking.dropoffLocation || booking.pickupLocation || '—'}</div>
                <div className="text-xs text-gray-400">{formatDateShort(booking.dropoffDateTime)}</div>
              </div>
              {booking.notes && (
                <div className="col-span-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Σημειώσεις</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{booking.notes}</div>
                </div>
              )}
              {booking.extras?.length > 0 && (
                <div className="col-span-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Extras</div>
                  <div className="flex flex-wrap gap-1">
                    {booking.extras.map((ex, i) => (
                      <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{ex.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 flex flex-wrap gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/bookings/${booking._id}`)}
              >
                📋 Λεπτομέρειες
              </Button>
              {canEdit && (
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  ✏️ Επεξεργασία
                </Button>
              )}
              {canExtend && (
                <Button size="sm" variant="outline" onClick={() => setExtendOpen(true)}>
                  ⏳ Παράταση
                </Button>
              )}
              {canCancel && (
                <Button size="sm" variant="danger" onClick={() => setCancelOpen(true)}>
                  ✕ Ακύρωση
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <EditBookingModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={booking}
        onUpdated={onUpdated}
      />
      <CancelBookingModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        booking={booking}
        onCanceled={onUpdated}
      />
      <ExtendBookingModal
        open={extendOpen}
        onClose={() => setExtendOpen(false)}
        booking={booking}
        onUpdated={onUpdated}
      />
    </>
  );
}
