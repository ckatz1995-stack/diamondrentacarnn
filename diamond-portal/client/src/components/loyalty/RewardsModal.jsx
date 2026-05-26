import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../../contexts/NotificationContext.jsx';
import api from '../../api/client.js';

export default function RewardsModal({ open, onClose, reward, currentPoints, onRedeemed }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const canAfford = currentPoints >= (reward?.pointsCost || 0);

  const handleRedeem = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/loyalty/redeem', { rewardId: reward._id });
      if (data.ok) {
        setCouponCode(data.couponCode || '');
        setSuccess(true);
        addToast('Εξαργύρωση επιτυχής!', 'success');
        onRedeemed?.();
      } else {
        setError(data.message || 'Δεν ήταν δυνατή η εξαργύρωση');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα κατά την εξαργύρωση');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    setCouponCode('');
    onClose();
  };

  if (!reward) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Εξαργύρωση Reward">
      {success ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Εξαργύρωση Επιτυχής!</h3>
          <p className="text-gray-500 text-sm">{reward.name}</p>
          {couponCode && (
            <div className="bg-brand-gold/10 border-2 border-brand-gold rounded-xl p-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Κωδικός κουπονιού</div>
              <div className="text-2xl font-black text-brand-teal tracking-wider">{couponCode}</div>
              <button
                onClick={() => { navigator.clipboard.writeText(couponCode); addToast('Αντιγράφηκε!', 'success'); }}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Αντιγραφή
              </button>
            </div>
          )}
          <Button onClick={handleClose} className="w-full">Κλείσιμο</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reward info */}
          <div className="bg-gradient-to-br from-brand-navy to-brand-teal rounded-xl p-5 text-center">
            <div className="text-4xl mb-2">{reward.icon || '🎁'}</div>
            <h3 className="text-white font-black text-lg">{reward.name}</h3>
            {reward.description && <p className="text-blue-200 text-sm mt-1">{reward.description}</p>}
          </div>

          {/* Points info */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Κόστος εξαργύρωσης</div>
              <div className="text-xl font-black text-brand-teal">{reward.pointsCost} πόντοι</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Διαθέσιμοι πόντοι</div>
              <div className={`text-xl font-black ${canAfford ? 'text-gray-800 dark:text-white' : 'text-red-500'}`}>
                {currentPoints} πόντοι
              </div>
            </div>
          </div>

          {!canAfford && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
              ⚠️ Δεν έχετε αρκετούς πόντους. Χρειάζεστε {reward.pointsCost - currentPoints} πόντους ακόμα.
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose} className="flex-1">Άκυρο</Button>
            <Button loading={loading} disabled={!canAfford} onClick={handleRedeem} className="flex-1">
              Εξαργύρωση
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
