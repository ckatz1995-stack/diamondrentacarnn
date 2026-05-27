import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';
import { TIER_LABELS, TIER_CLASSES } from '../utils/statusColors.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import TierProgressBar from '../components/loyalty/TierProgressBar.jsx';
import PointsHistory from '../components/loyalty/PointsHistory.jsx';
import RewardsModal from '../components/loyalty/RewardsModal.jsx';
import api from '../api/client.js';

const TIER_BENEFITS = {
  new: ['Βασική χρέωση', 'Email υποστήριξη', '1 πόντος / €1'],
  silver: ['5% έκπτωση', 'Προτεραιότητα εξυπηρέτησης', '1.5 πόντοι / €1'],
  gold: ['10% έκπτωση', 'Δωρεάν αναβάθμιση', 'Τηλεφωνική υποστήριξη', '2 πόντοι / €1'],
  platinum: ['15% έκπτωση', 'Δωρεάν παράδοση', 'Αφοσιωμένος agent', '3 πόντοι / €1', 'Lounge πρόσβαση'],
};

export default function Loyalty() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [referralCopied, setReferralCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [histRes, rwRes] = await Promise.all([
        api.get('/loyalty/history'),
        api.get('/loyalty/rewards'),
      ]);
      if (histRes.data.ok) setHistory(histRes.data.history || []);
      if (rwRes.data.ok) setRewards(rwRes.data.rewards || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loyalty = user?.loyalty || {};
  const points = loyalty.points || 0;
  const tier = loyalty.tier || 'new';
  const referralCode = user?.referralCode || '';
  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '';

  const handleCopyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    addToast('Σύνδεσμος αντιγράφηκε!', 'success');
    setTimeout(() => setReferralCopied(false), 3000);
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Πρόγραμμα Loyalty</h1>

      {/* Points counter */}
      <div className="bg-gradient-to-br from-brand-navy to-brand-teal rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>
        <div className="relative">
          <div className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Διαθέσιμοι Πόντοι</div>
          <div className="text-7xl font-black text-white mb-1">{points.toLocaleString('el-GR')}</div>
          <div className="text-brand-gold font-bold text-lg">πόντοι</div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/20 text-white`}>
              {TIER_LABELS[tier]}
            </span>
          </div>
        </div>
      </div>

      {/* Tier progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Πρόοδος Επιπέδου</h2>
        <TierProgressBar currentTier={tier} points={points} />
      </div>

      {/* Tier benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Προνόμια ανά Επίπεδο</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(TIER_BENEFITS).map(([t, benefits]) => (
            <div key={t} className={`rounded-xl p-4 ${t === tier ? 'ring-2 ring-brand-teal bg-brand-teal/5' : 'bg-gray-50 dark:bg-gray-700'}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${TIER_CLASSES[t]} px-2 py-0.5 rounded-full inline-block`}>
                {TIER_LABELS[t]}
              </div>
              {t === tier && <div className="text-xs text-brand-teal font-bold mb-2">← Τρέχον επίπεδό σας</div>}
              <ul className="space-y-1">
                {benefits.map((b, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-brand-teal">✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards catalog */}
      {rewards.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Κατάλογος Rewards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map(reward => {
              const canAfford = points >= reward.pointsCost;
              return (
                <div key={reward._id} className={`rounded-xl p-4 border-2 transition-all ${canAfford ? 'border-brand-teal/30 hover:border-brand-teal' : 'border-gray-200 dark:border-gray-700 opacity-75'}`}>
                  <div className="text-3xl mb-2">{reward.icon || '🎁'}</div>
                  <div className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{reward.name}</div>
                  {reward.description && <div className="text-xs text-gray-400 mb-3">{reward.description}</div>}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-brand-teal font-black text-sm">{reward.pointsCost} π.</span>
                    <button
                      onClick={() => setSelectedReward(reward)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-brand-teal text-white hover:bg-teal-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Εξαργύρωση' : `${reward.pointsCost - points} π. ακόμα`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points history */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Ιστορικό Πόντων</h2>
        <PointsHistory history={history} />
      </div>

      {/* Referral */}
      <div className="bg-gradient-to-br from-brand-gold/10 to-brand-cream dark:from-brand-gold/5 dark:to-gray-800 border border-brand-gold/30 rounded-2xl p-6">
        <div className="text-2xl mb-2">🎁</div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-1">Προσκαλέστε φίλους</h2>
        <p className="text-sm text-gray-500 mb-4">
          Κερδίστε <strong className="text-brand-teal">200 πόντους</strong> για κάθε φίλο που κάνει εγγραφή με τον σύνδεσμό σας!
        </p>
        {referralLink ? (
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-300 focus:outline-none"
            />
            <button
              onClick={handleCopyReferral}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                referralCopied ? 'bg-green-500 text-white' : 'bg-brand-teal text-white hover:bg-teal-700'
              }`}
            >
              {referralCopied ? '✅' : '📋 Αντιγραφή'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Ο κωδικός παραπομπής δεν είναι διαθέσιμος</p>
        )}
      </div>

      {/* Rewards modal */}
      <RewardsModal
        open={!!selectedReward}
        onClose={() => setSelectedReward(null)}
        reward={selectedReward}
        currentPoints={points}
        onRedeemed={fetchData}
      />
    </div>
  );
}
