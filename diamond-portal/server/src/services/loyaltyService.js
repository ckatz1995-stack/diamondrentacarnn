import { User } from '../models/User.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';

export function computeTier(completedRentals) {
  if (completedRentals >= 7) return 'platinum';
  if (completedRentals >= 3) return 'gold';
  if (completedRentals >= 1) return 'silver';
  return 'new';
}

export function pointsForBooking(totalPrice) {
  return Math.floor(totalPrice / 10);
}

export async function awardPoints(userId, bookingId, totalPrice, type = 'earned', description) {
  const points = type === 'earned' ? pointsForBooking(totalPrice) : totalPrice;
  await LoyaltyTransaction.create({ userId, bookingId, type, points, description });
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: points } },
    { new: true }
  );
  return user;
}

export async function updateTierFromRentals(userId, completedRentals) {
  const tier = computeTier(completedRentals);
  await User.findByIdAndUpdate(userId, { loyaltyTier: tier, totalCompletedRentals: completedRentals });
  return tier;
}

export const REWARDS_CATALOG = [
  { id: 'discount5', name: '5% έκπτωση', description: 'Έκπτωση 5% στην επόμενη κράτηση', pointsCost: 50, type: 'discount' },
  { id: 'discount10', name: '10% έκπτωση', description: 'Έκπτωση 10% στην επόμενη κράτηση', pointsCost: 100, type: 'discount' },
  { id: 'free_gps', name: 'Δωρεάν GPS', description: 'Δωρεάν GPS για μια κράτηση', pointsCost: 30, type: 'extra' },
  { id: 'upgrade', name: 'Δωρεάν Αναβάθμιση', description: 'Αναβάθμιση κατηγορίας οχήματος', pointsCost: 200, type: 'upgrade' },
];
