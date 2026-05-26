import { formatEUR } from '../../utils/currency.js';
import { Skeleton } from '../ui/Skeleton.jsx';

export default function StatsGrid({ stats, loading }) {
  const items = [
    { label: 'Συνολικές δαπάνες', value: formatEUR(stats?.totalSpend), icon: '💰', color: 'text-brand-teal' },
    { label: 'Ημέρες ενοικίασης', value: stats?.totalDays ?? '—', icon: '📅', color: 'text-blue-600', suffix: ' μέρες' },
    { label: 'Συνολικές κρατήσεις', value: stats?.totalTrips ?? '—', icon: '🚗', color: 'text-purple-600', suffix: ' ταξίδια' },
    { label: 'Εκτιμώμενο CO₂', value: stats?.co2Kg ?? '—', icon: '🌱', color: 'text-green-600', suffix: ' kg CO₂' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          {loading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-lg mb-3" />
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className={`text-xl font-black ${item.color}`}>
                {item.value}{item.suffix || ''}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">{item.label}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
