import express from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import { REWARDS_CATALOG, computeTier } from '../services/loyaltyService.js';
import { TIER_LABELS } from '../utils/greekText.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const redeemSchema = z.object({
  rewardId: z.string().min(1, 'Απαιτείται ID ανταμοιβής'),
});

// GET /api/loyalty
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('loyaltyPoints loyaltyTier totalCompletedRentals totalSpend referralCode')
      .lean();

    const tierOrder = { new: 0, silver: 1, gold: 2, platinum: 3 };
    const tierThresholds = { new: 0, silver: 1, gold: 3, platinum: 7 };
    const nextTierMap = { new: 'silver', silver: 'gold', gold: 'platinum', platinum: null };
    const nextTier = nextTierMap[user.loyaltyTier];
    const nextTierThreshold = nextTier ? tierThresholds[nextTier] : null;
    const rentalsUntilNext = nextTierThreshold ? Math.max(0, nextTierThreshold - user.totalCompletedRentals) : 0;

    res.json({
      ok: true,
      loyalty: {
        points: user.loyaltyPoints,
        tier: user.loyaltyTier,
        tierLabel: TIER_LABELS[user.loyaltyTier],
        totalCompletedRentals: user.totalCompletedRentals,
        totalSpend: user.totalSpend,
        nextTier,
        nextTierLabel: nextTier ? TIER_LABELS[nextTier] : null,
        rentalsUntilNext,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/loyalty/transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { userId: req.user._id };
    if (type) filter.type = type;

    const [transactions, total] = await Promise.all([
      LoyaltyTransaction.find(filter)
        .populate('bookingId', 'bookingNumber vehicleName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      LoyaltyTransaction.countDocuments(filter),
    ]);

    const typeLabels = { earned: 'Κερδήθηκαν', redeemed: 'Εξαργυρώθηκαν', bonus: 'Bonus', expired: 'Έληξαν' };

    res.json({
      ok: true,
      transactions: transactions.map(t => ({
        ...t,
        typeLabel: typeLabels[t.type] || t.type,
        signed: t.type === 'redeemed' || t.type === 'expired' ? -t.points : t.points,
      })),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/loyalty/rewards
router.get('/rewards', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints').lean();
    const catalog = REWARDS_CATALOG.map(r => ({
      ...r,
      canRedeem: user.loyaltyPoints >= r.pointsCost,
    }));

    res.json({ ok: true, rewards: catalog, availablePoints: user.loyaltyPoints });
  } catch (err) {
    next(err);
  }
});

// POST /api/loyalty/redeem
router.post('/redeem', validate(redeemSchema), async (req, res, next) => {
  try {
    const { rewardId } = req.body;
    const reward = REWARDS_CATALOG.find(r => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Η ανταμοιβή δεν βρέθηκε' });
    }

    const user = await User.findById(req.user._id);
    if (user.loyaltyPoints < reward.pointsCost) {
      return res.status(400).json({
        ok: false,
        error: 'insufficient_points',
        message: `Ανεπαρκείς πόντοι. Χρειάζεστε ${reward.pointsCost} πόντους, έχετε ${user.loyaltyPoints}.`,
      });
    }

    // Deduct points
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: -reward.pointsCost } });
    await LoyaltyTransaction.create({
      userId: req.user._id,
      type: 'redeemed',
      points: reward.pointsCost,
      description: `Εξαργύρωση: ${reward.name}`,
    });

    logger.info('Reward redeemed', { userId: req.user._id, rewardId, pointsCost: reward.pointsCost });

    res.json({
      ok: true,
      reward,
      remainingPoints: user.loyaltyPoints - reward.pointsCost,
      message: `Η ανταμοιβή "${reward.name}" εξαργυρώθηκε επιτυχώς!`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/loyalty/referral
router.get('/referral', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode').lean();
    const referralLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`;

    const referrals = await User.countDocuments({ referredBy: req.user._id });

    res.json({
      ok: true,
      referralCode: user.referralCode,
      referralLink,
      totalReferrals: referrals,
      pointsPerReferral: 50,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
