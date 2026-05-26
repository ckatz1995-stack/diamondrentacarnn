import { formatDateTime } from '../../utils/greekDates.js';

const TYPE_CONFIG = {
  earned: { icon: '➕', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Κερδήθηκαν' },
  redeemed: { icon: '➖', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Εξαργυρώθηκαν' },
  bonus: { icon: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Bonus' },
  expired: { icon: '⏰', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20', label: 'Έληξαν' },
};

export default function PointsHistory({ history }) {
  if (!history?.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">Δεν υπάρχει ιστορικό πόντων</div>
  );

  return (
    <div className="space-y-2">
      {history.map((entry, idx) => {
        const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.earned;
        return (
          <div key={entry._id || idx} className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
            <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {entry.description || cfg.label}
              </div>
              <div className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</div>
            </div>
            <div className={`text-sm font-black flex-shrink-0 ${cfg.color}`}>
              {entry.type === 'redeemed' || entry.type === 'expired' ? '-' : '+'}{Math.abs(entry.points)} π.
            </div>
          </div>
        );
      })}
    </div>
  );
}
