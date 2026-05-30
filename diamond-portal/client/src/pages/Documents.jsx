import { useState, useCallback, useEffect } from 'react';
import api from '../api/client.js';
import { formatDate } from '../utils/greekDates.js';
import { BookingCardSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';

function DocumentItem({ doc, type }) {
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const endpoint = type === 'voucher'
        ? `/documents/bookings/${doc.bookingId}/voucher`
        : `/documents/bookings/${doc.bookingId}/invoice`;
      const { data } = await api.get(endpoint, { responseType: 'blob' });
      const filename = type === 'voucher'
        ? `voucher-${doc.bookingNumber}.pdf`
        : `invoice-${doc.bookingNumber}.pdf`;
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast('Σφάλμα κατά τη λήψη του εγγράφου', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-xl flex-shrink-0">
        {type === 'voucher' ? '🎫' : '🧾'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
          {doc.title || (type === 'voucher'
            ? `Voucher κράτησης ${doc.bookingNumber || ''}`
            : `Τιμολόγιο ${doc.invoiceNumber || ''}`)}
        </div>
        {doc.vehicle && (
          <div className="text-xs text-gray-400">{doc.vehicle}</div>
        )}
        <div className="text-xs text-gray-400">{formatDate(doc.date || doc.createdAt)}</div>
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors flex-shrink-0 disabled:opacity-50"
      >
        {downloading
          ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <span>📥</span>}
        <span>{downloading ? 'Λήψη...' : 'Λήψη'}</span>
      </button>
    </div>
  );
}

export default function Documents() {
  const [vouchers, setVouchers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, iRes] = await Promise.all([
        api.get('/documents/vouchers'),
        api.get('/documents/invoices'),
      ]);
      if (vRes.data.ok) setVouchers(vRes.data.vouchers || []);
      if (iRes.data.ok) setInvoices(iRes.data.invoices || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      {[1, 2, 3].map(i => <BookingCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Έγγραφα</h1>

      {/* Vouchers */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <span className="text-xl">🎫</span>
          <h2 className="font-bold text-gray-900 dark:text-white">Vouchers Κρατήσεων</h2>
          <span className="ml-auto text-xs text-gray-400">{vouchers.length} έγγραφα</span>
        </div>
        {vouchers.length === 0 ? (
          <EmptyState icon="🎫" title="Δεν υπάρχουν vouchers" description="Τα vouchers εμφανίζονται για επιβεβαιωμένες και ολοκληρωμένες κρατήσεις." />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {vouchers.map(v => <DocumentItem key={String(v._id)} doc={v} type="voucher" />)}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <span className="text-xl">🧾</span>
          <h2 className="font-bold text-gray-900 dark:text-white">Τιμολόγια</h2>
          <span className="ml-auto text-xs text-gray-400">{invoices.length} έγγραφα</span>
        </div>
        {invoices.length === 0 ? (
          <EmptyState icon="🧾" title="Δεν υπάρχουν τιμολόγια" description="Τα τιμολόγια εκδίδονται αυτόματα για ολοκληρωμένες κρατήσεις." />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {invoices.map(inv => <DocumentItem key={String(inv._id)} doc={inv} type="invoice" />)}
          </div>
        )}
      </div>
    </div>
  );
}
