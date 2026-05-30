import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/client.js';
import { formatDate } from '../utils/greekDates.js';
import { formatEUR } from '../utils/currency.js';
import { TIER_LABELS, TIER_CLASSES } from '../utils/statusColors.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';

const TIER_ICONS = { new: '🌱', silver: '🥈', gold: '🥇', platinum: '💎' };

const QUICK_LINKS = [
  { to: '/bookings',    icon: '📋', label: 'Κρατήσεις',    bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400' },
  { to: '/documents',   icon: '📄', label: 'Έγγραφα',       bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  { to: '/loyalty',     icon: '🏆', label: 'Loyalty',       bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
  { to: '/analytics',   icon: '📊', label: 'Ανάλυση',       bg: 'bg-teal-50 dark:bg-teal-900/20',   text: 'text-brand-teal dark:text-teal-400' },
  { to: '/support',     icon: '🎧', label: 'Υποστήριξη',    bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  { to: '/profile',     icon: '👤', label: 'Προφίλ',         bg: 'bg-gray-100 dark:bg-gray-700',     text: 'text-gray-600 dark:text-gray-300' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextTrip, setNextTrip] = useState(null);
  const [totalBookings, setTotalBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, listRes] = await Promise.all([
          api.get('/bookings?upcoming=true&limit=1&sort=oldest'),
          api.get('/bookings?limit=1'),
        ]);
        if (tripRes.data.ok) setNextTrip(tripRes.data.bookings?.[0] ?? null);
        if (listRes.data.ok) setTotalBookings(listRes.data.total ?? 0);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const tier = user?.loyaltyTier || 'new';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Welcome banner */}
      <div className="bg-brand-dark rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-5 top-3 text-7xl opacity-10 font-black select-none">◆</div>
        <p className="text-gray-400 text-sm mb-1">Καλωσήρθατε πίσω</p>
        <h1 className="text-2xl font-black mb-4">
          {user?.firstName ? `Γεια, ${user.firstName}!` : 'Γεια σας!'}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-black px-3 py-1 rounded-full ${TIER_CLASSES[tier]}`}>
            {TIER_ICONS[tier]} {TIER_LABELS[tier]}
          </span>
          <span className="text-sm text-gray-300">
            <span className="text-brand-gold font-black">{user?.loyaltyPoints ?? 0}</span> πόντοι
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl mb-1">🚗</div>
          {loading
            ? <Skeleton className="h-7 w-10 mb-1" />
            : <div className="text-2xl font-black text-brand-teal">{totalBookings ?? '—'}</div>
          }
          <div className="text-xs text-gray-400 font-medium mt-0.5">Συνολικές κρατήσεις</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-2xl font-black text-brand-gold">{user?.loyaltyPoints ?? 0}</div>
          <div className="text-xs text-gray-400 font-medium mt-0.5">Πόντοι loyalty</div>
        </div>
      </div>

      {/* Next trip */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
      )}

      {!loading && nextTrip && (
        <button
          onClick={() => navigate(`/bookings/${nextTrip._id}`)}
          className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-brand-teal/40 hover:shadow-md hover:border-brand-teal transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-brand-teal uppercase tracking-wider">Επόμενο ταξίδι</span>
            <span className="text-xs text-gray-400 font-mono">{nextTrip.bookingNumber}</span>
          </div>
          <div className="font-black text-gray-900 dark:text-white text-lg leading-tight">
            {nextTrip.vehicleName || `${nextTrip.vehicle?.make || ''} ${nextTrip.vehicle?.model || ''}`.trim() || 'Όχημα'}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 flex-wrap">
            <span>📅 {formatDate(nextTrip.pickupDateTime)}</span>
            {nextTrip.pickupLocation && <><span>·</span><span>📍 {nextTrip.pickupLocation}</span></>}
          </div>
          <div className="mt-3 font-black text-brand-teal">{formatEUR(nextTrip.totalPrice)}</div>
        </button>
      )}

      {!loading && !nextTrip && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-4xl mb-2">🚙</div>
          <div className="font-bold text-gray-600 dark:text-gray-300 mb-1">Δεν έχετε επερχόμενες κρατήσεις</div>
          <div className="text-sm text-gray-400">Επισκεφτείτε την ιστοσελίδα μας για να κάνετε κράτηση</div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Γρήγορη πρόσβαση</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-transform active:scale-95 hover:scale-105 ${link.bg} ${link.text}`}
            >
              <span className="text-2xl mb-1">{link.icon}</span>
              <span className="text-xs font-bold text-center leading-tight">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
