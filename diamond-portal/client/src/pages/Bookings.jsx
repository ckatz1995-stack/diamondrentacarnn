import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { BookingCardSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import BookingCard from '../components/bookings/BookingCard.jsx';
import NextTripBanner from '../components/bookings/NextTripBanner.jsx';

const FILTERS = [
  { key: '', label: 'Όλες' },
  { key: 'upcoming', label: 'Επερχόμενες' },
  { key: 'Active', label: 'Ενεργές' },
  { key: 'Completed', label: 'Ολοκληρωμένες' },
  { key: 'Canceled', label: 'Ακυρωμένες' },
];

const SORTS = [
  { key: 'newest', label: 'Νεότερες πρώτα' },
  { key: 'oldest', label: 'Παλαιότερες πρώτα' },
  { key: 'price_desc', label: 'Υψηλότερη τιμή' },
  { key: 'price_asc', label: 'Χαμηλότερη τιμή' },
];

const PAGE_SIZE = 10;

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [nextTrip, setNextTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBookings = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ limit: PAGE_SIZE, page: pageNum, sort });
      if (filter === 'upcoming') { params.set('upcoming', 'true'); }
      else if (filter) { params.set('status', filter); }
      if (search.trim()) params.set('search', search.trim());

      const { data } = await api.get(`/bookings?${params}`);
      if (data.ok) {
        const list = data.bookings || [];
        if (append) setBookings(prev => [...prev, ...list]);
        else setBookings(list);
        setTotal(data.total || 0);
      }
    } catch {}
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, sort, search]);

  const fetchNextTrip = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings?upcoming=true&limit=1&sort=oldest');
      if (data.ok && data.bookings?.length > 0) setNextTrip(data.bookings[0]);
      else setNextTrip(null);
    } catch {}
  }, []);

  useEffect(() => {
    setPage(1);
    fetchBookings(1, false);
    fetchNextTrip();
  }, [fetchBookings, fetchNextTrip]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBookings(nextPage, true);
  };

  const handleUpdated = () => {
    fetchBookings(1, false);
    fetchNextTrip();
    setPage(1);
  };

  const hasMore = bookings.length < total;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Κρατήσεις</h1>
        <span className="text-sm text-gray-400">{total} σύνολο</span>
      </div>

      {/* Next trip banner */}
      {!loading && nextTrip && <NextTripBanner booking={nextTrip} />}

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Αναζήτηση αριθμού κράτησης ή οχήματος..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Filter chips + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap flex-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f.key
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-800 dark:text-white"
        >
          {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <BookingCardSkeleton key={i} />)}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Δεν βρέθηκαν κρατήσεις"
          description={search ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης' : 'Οι κρατήσεις σας θα εμφανιστούν εδώ'}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <BookingCard key={b._id} booking={b} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loadingMore && <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />}
            {loadingMore ? 'Φόρτωση...' : `Φόρτωση περισσότερων (${total - bookings.length} ακόμα)`}
          </button>
        </div>
      )}
    </div>
  );
}
