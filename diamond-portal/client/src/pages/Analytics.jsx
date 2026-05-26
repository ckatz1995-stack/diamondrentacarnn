import { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import StatsGrid from '../components/analytics/StatsGrid.jsx';
import { MonthlySpendChart, CategoryPieChart } from '../components/analytics/SpendChart.jsx';
import { formatEUR } from '../utils/currency.js';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const { data } = await api.get(`/analytics?${params}`);
      if (data.ok) setStats(data.analytics);
    } catch {}
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: 'csv' });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const { data } = await api.get(`/analytics/export?${params}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `diamond-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    finally { setExporting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ανάλυση</h1>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          {exporting
            ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            : '📥'}
          Εξαγωγή CSV
        </button>
      </div>

      {/* Date range filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Φίλτρο χρονικής περιόδου</div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-gray-400 mb-1">Από</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-gray-400 mb-1">Έως</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
            />
          </div>
          {(startDate || endDate) && (
            <div className="flex items-end">
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                Εκκαθάριση
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <StatsGrid stats={stats} loading={loading} />

      {/* Monthly spend chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Μηνιαίες Δαπάνες</h2>
        {loading ? <Skeleton className="h-64 w-full" /> : <MonthlySpendChart data={stats?.monthlySpend} />}
      </div>

      {/* Category pie + locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Κατηγορίες Οχημάτων</h2>
          {loading ? <Skeleton className="h-48 w-full" /> : <CategoryPieChart data={stats?.categoryBreakdown} />}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Τοποθεσίες Παραλαβής</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !stats?.topLocations?.length ? (
            <div className="text-center py-6 text-gray-400 text-sm">Δεν υπάρχουν δεδομένα</div>
          ) : (
            <div className="space-y-3">
              {stats.topLocations.map((loc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-teal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{loc.location}</div>
                    <div className="text-xs text-gray-400">{loc.count} κρατήσεις</div>
                  </div>
                  <div className="text-sm font-bold text-brand-teal">{formatEUR(loc.totalSpend)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
