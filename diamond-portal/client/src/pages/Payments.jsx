import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { formatDate } from '../utils/greekDates.js';
import { formatEUR } from '../utils/currency.js';
import { BookingCardSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const PAYMENT_STATUS = {
  paid: { label: 'Πληρωμένο', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Εκκρεμεί', class: 'bg-yellow-100 text-yellow-700' },
  refunded: { label: 'Επιστράφηκε', class: 'bg-blue-100 text-blue-700' },
  failed: { label: 'Απέτυχε', class: 'bg-red-100 text-red-700' },
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments');
      if (data.ok) {
        setPayments(data.payments || []);
        setTotal(data.totalAmount || 0);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const { data } = await api.get(`/payments/${paymentId}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch {
      // Fallback: open URL
      window.open(`/api/payments/${paymentId}/invoice`, '_blank');
    }
  };

  const grandTotal = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Πληρωμές</h1>
      </div>

      {/* Summary card */}
      {!loading && payments.length > 0 && (
        <div className="bg-gradient-to-r from-brand-navy to-brand-teal rounded-2xl p-6">
          <div className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Συνολικές Δαπάνες</div>
          <div className="text-white font-black text-4xl">{formatEUR(grandTotal)}</div>
          <div className="text-blue-200 text-xs mt-1">{payments.filter(p => p.status === 'paid').length} πληρωμένες κρατήσεις</div>
        </div>
      )}

      {/* Payments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <BookingCardSkeleton key={i} />)}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon="💳" title="Δεν υπάρχουν πληρωμές" description="Οι πληρωμές σας θα εμφανιστούν εδώ" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {payments.map(payment => {
              const statusCfg = PAYMENT_STATUS[payment.status] || PAYMENT_STATUS.pending;
              return (
                <div key={payment._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="font-bold text-gray-900 dark:text-white text-sm">
                        {payment.bookingNumber || payment.booking?.bookingNumber || '—'}
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.class}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {payment.description || (payment.booking?.vehicle ? `${payment.booking.vehicle.make} ${payment.booking.vehicle.model}` : '—')}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(payment.createdAt || payment.paidAt)}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-black text-brand-teal">{formatEUR(payment.amount)}</div>
                      {payment.paymentMethod && (
                        <div className="text-xs text-gray-400">{payment.paymentMethod}</div>
                      )}
                    </div>
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleDownloadInvoice(payment._id)}
                        className="p-2 text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
                        title="Λήψη τιμολογίου"
                      >
                        📄
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
