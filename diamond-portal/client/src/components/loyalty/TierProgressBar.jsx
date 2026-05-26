import { TIER_LABELS } from '../../utils/statusColors.js';

const TIER_ORDER = ['new', 'silver', 'gold', 'platinum'];
const TIER_THRESHOLDS = { new: 0, silver: 500, gold: 2000, platinum: 5000 };
const TIER_COLORS = {
  new: 'text-gray-500',
  silver: 'text-slate-500',
  gold: 'text-yellow-600',
  platinum: 'text-blue-600',
};
const TIER_DOT_COLORS = {
  new: 'bg-gray-300',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-blue-500',
};

export default function TierProgressBar({ currentTier, points }) {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const nextTier = TIER_ORDER[currentIdx + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
  const currentThreshold = TIER_THRESHOLDS[currentTier] || 0;
  const progress = nextThreshold
    ? Math.min(100, ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;

  return (
    <div>
      {/* Tier dots */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
        {TIER_ORDER.map((tier, idx) => {
          const done = idx <= currentIdx;
          return (
            <div key={tier} className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                done ? `${TIER_DOT_COLORS[tier]} border-transparent` : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}>
                {done && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <div className={`text-xs font-bold ${done ? TIER_COLORS[tier] : 'text-gray-400'}`}>
                {tier === 'new' ? 'Νέο' : tier === 'silver' ? 'Αργ.' : tier === 'gold' ? 'Χρυσό' : 'Plat.'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-brand-teal to-brand-gold transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Labels */}
      {nextTier ? (
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{points} πόντοι</span>
          <span>{nextThreshold - points} ακόμα για {TIER_LABELS[nextTier]}</span>
        </div>
      ) : (
        <div className="text-center text-xs text-brand-gold font-bold mt-2">
          🏆 Έχετε φτάσει το ανώτατο επίπεδο!
        </div>
      )}
    </div>
  );
}
