import { Booking } from '../models/Booking.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

export async function checkAvailability(categoryId, pickupDateTime, dropoffDateTime, excludeBookingId = null) {
  const key = `avail:${categoryId}:${pickupDateTime}:${dropoffDateTime}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const query = {
    categoryId,
    status: { $in: ['Confirmed', 'Active', 'Pending'] },
    pickupDateTime: { $lt: new Date(dropoffDateTime) },
    dropoffDateTime: { $gt: new Date(pickupDateTime) },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflicts = await Booking.countDocuments(query);
  const result = { available: conflicts === 0, conflicts };
  cache.set(key, result);
  return result;
}

export function invalidateCache(categoryId) {
  const keys = cache.keys().filter(k => k.startsWith(`avail:${categoryId}:`));
  keys.forEach(k => cache.del(k));
}
