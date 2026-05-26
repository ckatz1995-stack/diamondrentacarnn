import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';
import { formatDate, formatDateTime } from '../utils/greekDates.js';
import { formatEUR } from '../utils/currency.js';
import { STATUS_LABELS, STATUS_CLASSES, TIER_LABELS, TIER_CLASSES } from '../utils/statusColors.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import api from '../api/client.js';

const TABS = [
  { key: 'stats', label: 'Στατιστικά', icon: '📊' },
  { key: 'members', label: 'Μέλη', icon: '👥' },
  { key: 'bookings', label: 'Κρατήσεις', icon: '📋' },
  { key: 'tickets', label: 'Tickets', icon: '🎧' },
];

function StatCard({ label, value, icon, color = 'text-brand-teal', loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      {loading ? (
        <>
          <Skeleton className="h-8 w-8 rounded-lg mb-3" />
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-28" />
        </>
      ) : (
        <>
          <div className="text-3xl mb-2">{icon}</div>
          <div className={`text-2xl font-black ${color}`}>{value}</div>
          <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
        </>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('open');

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    navigate('/bookings', { replace: true });
    return null;
  }

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      if (data.ok) setStats(data.stats);
    } catch {}
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (memberSearch) params.set('search', memberSearch);
      const { data } = await api.get(`/admin/members?${params}`);
      if (data.ok) setMembers(data.members || []);
    } catch {}
  }, [memberSearch]);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (bookingFilter) params.set('status', bookingFilter);
      const { data } = await api.get(`/admin/bookings?${params}`);
      if (data.ok) setBookings(data.bookings || []);
    } catch {}
  }, [bookingFilter]);

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (ticketFilter) params.set('status', ticketFilter);
      const { data } = await api.get(`/admin/tickets?${params}`);
      if (data.ok) setTickets(data.tickets || []);
    } catch {}
  }, [ticketFilter]);

  useEffect(() => {
    setLoading(true);
    const promises = [];
    if (activeTab === 'stats') promises.push(fetchStats());
    if (activeTab === 'members') promises.push(fetchMembers());
    if (activeTab === 'bookings') promises.push(fetchBookings());
    if (activeTab === 'tickets') promises.push(fetchTickets());
    Promise.all(promises).finally(() => setLoading(false));
  }, [activeTab, fetchStats, fetchMembers, fetchBookings, fetchTickets]);

  const handleTicketStatusChange = async (ticketId, newStatus) => {
    try {
      const { data } = await api.put(`/admin/tickets/${ticketId}`, { status: newStatus });
      if (data.ok) {
        addToast('Status ενημερώθηκε', 'success');
        fetchTickets();
      }
    } catch { addToast('Σφάλμα', 'error'); }
  };

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      const { data } = await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      if (data.ok) {
        addToast('Status κράτησης ενημερώθηκε', 'success');
        fetchBookings();
      }
    } catch { addToast('Σφάλμα', 'error'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚙️</span>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Διαχείριση</h1>
          <p className="text-sm text-gray-400">Admin Panel — Diamond Rent A Car</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-brand-teal shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Συνολικά Μέλη" value={stats?.totalMembers ?? '—'} icon="👥" loading={loading} />
            <StatCard label="Ενεργές Κρατήσεις" value={stats?.activeBookings ?? '—'} icon="🚗" color="text-blue-600" loading={loading} />
            <StatCard label="Έσοδα (Μήνας)" value={stats?.monthlyRevenue != null ? formatEUR(stats.monthlyRevenue) : '—'} icon="💰" loading={loading} />
            <StatCard label="Ανοιχτά Tickets" value={stats?.openTickets ?? '—'} icon="🎧" color="text-red-500" loading={loading} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Κρατήσεις (Μήνας)" value={stats?.monthlyBookings ?? '—'} icon="📋" loading={loading} />
            <StatCard label="Νέα Μέλη (Μήνας)" value={stats?.newMembers ?? '—'} icon="🆕" color="text-green-600" loading={loading} />
            <StatCard label="Ακυρώσεις" value={stats?.cancellations ?? '—'} icon="❌" color="text-orange-500" loading={loading} />
            <StatCard label="Μέσο Rating" value={stats?.avgRating ? `${stats.avgRating.toFixed(1)}/5` : '—'} icon="⭐" color="text-yellow-600" loading={loading} />
          </div>
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <input
            type="search"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            placeholder="Αναζήτηση μέλους (email, όνομα)..."
            className="w-full max-w-md px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-800 dark:text-white"
          />

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Δεν βρέθηκαν μέλη</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Μέλος</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Επίπεδο</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Κρατήσεις</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Εγγραφή</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {members.map(member => (
                      <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{member.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_CLASSES[member.loyalty?.tier || 'new']}`}>
                            {TIER_LABELS[member.loyalty?.tier || 'new']}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{member.bookingCount || 0}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(member.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'Pending', 'Confirmed', 'Active', 'Completed', 'Canceled'].map(status => (
              <button
                key={status}
                onClick={() => setBookingFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  bookingFilter === status
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {status ? STATUS_LABELS[status] : 'Όλες'}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Δεν βρέθηκαν κρατήσεις</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Αρ. Κράτησης</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Μέλος</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Όχημα</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ποσό</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ενέργεια</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {bookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{booking.bookingNumber}</td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {booking.member?.firstName} {booking.member?.lastName}
                          <div className="text-xs text-gray-400">{booking.member?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </td>
                        <td className="px-4 py-3 font-bold text-brand-teal">{formatEUR(booking.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_CLASSES[booking.status]}`}>
                            {STATUS_LABELS[booking.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={booking.status}
                            onChange={e => handleBookingStatusChange(booking._id, e.target.value)}
                            className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
                          >
                            {['Pending', 'Confirmed', 'Active', 'Completed', 'Canceled'].map(s => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tickets tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'open', 'pending', 'resolved', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setTicketFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  ticketFilter === s
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {s === '' ? 'Όλα' : s === 'open' ? 'Ανοιχτά' : s === 'pending' ? 'Σε εξέλιξη' : s === 'resolved' ? 'Επιλυμένα' : 'Κλειστά'}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Δεν βρέθηκαν tickets</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {tickets.map(ticket => (
                  <div key={ticket._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">#{ticket.ticketNumber || ticket._id?.slice(-6)}</span>
                          {ticket.category && <span className="text-xs text-gray-400">{ticket.category}</span>}
                        </div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{ticket.subject}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {ticket.member?.firstName} {ticket.member?.lastName} — {ticket.member?.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{formatDateTime(ticket.updatedAt || ticket.createdAt)}</div>
                      </div>
                      <select
                        value={ticket.status}
                        onChange={e => handleTicketStatusChange(ticket._id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-teal dark:bg-gray-700 dark:text-white flex-shrink-0"
                      >
                        {['open', 'pending', 'resolved', 'closed'].map(s => (
                          <option key={s} value={s}>
                            {s === 'open' ? 'Ανοιχτό' : s === 'pending' ? 'Σε εξέλιξη' : s === 'resolved' ? 'Επιλυμένο' : 'Κλειστό'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
