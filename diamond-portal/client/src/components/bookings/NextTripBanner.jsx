import { useNavigate } from 'react-router-dom';
import { formatDateShort, countdown } from '../../utils/greekDates.js';
import { formatEUR } from '../../utils/currency.js';

export default function NextTripBanner({ booking }) {
  const navigate = useNavigate();
  if (!booking) return null;

  return (
    <div
      className="bg-gradient-to-r from-brand-navy to-brand-teal rounded-2xl p-5 mb-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/bookings/${booking._id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-wider">Επόμενο Ταξίδι</span>
            <span className="bg-brand-gold/20 text-brand-gold text-xs font-bold px-2 py-0.5 rounded-full">
              {countdown(booking.pickupDateTime)}
            </span>
          </div>
          <h3 className="text-white font-black text-lg truncate">
            {booking.vehicle?.make} {booking.vehicle?.model}
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            📍 {booking.pickupLocation}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-blue-200">
            <span>🗓️ {formatDateShort(booking.pickupDateTime)}</span>
            <span>→ {formatDateShort(booking.dropoffDateTime)}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-white font-black text-xl">{formatEUR(booking.totalAmount)}</div>
          <div className="text-blue-200 text-xs">{booking.bookingNumber}</div>
          <div className="mt-3 bg-brand-gold text-brand-dark text-xs font-bold px-3 py-1.5 rounded-lg">
            Λεπτομέρειες →
          </div>
        </div>
      </div>
    </div>
  );
}
