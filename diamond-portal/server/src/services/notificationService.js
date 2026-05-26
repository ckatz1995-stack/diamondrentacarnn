import { Notification } from '../models/Notification.js';

export async function createNotification(userId, type, title, body, relatedBookingId = null) {
  return Notification.create({ userId, type, title, body, relatedBookingId });
}

export async function notifyBookingConfirmed(userId, booking) {
  return createNotification(
    userId,
    'booking_confirmed',
    'Επιβεβαίωση Κράτησης',
    `Η κράτησή σας #${booking.bookingNumber} επιβεβαιώθηκε για ${booking.vehicleName}.`,
    booking._id
  );
}

export async function notifyBookingChanged(userId, booking) {
  return createNotification(
    userId,
    'booking_changed',
    'Αλλαγή Κράτησης',
    `Η κράτηση #${booking.bookingNumber} ενημερώθηκε.`,
    booking._id
  );
}

export async function notifyTripReminder(userId, booking) {
  return createNotification(
    userId,
    'trip_reminder',
    'Υπενθύμιση Ταξιδιού',
    `Η κράτησή σας για ${booking.vehicleName} ξεκινά αύριο!`,
    booking._id
  );
}

export async function notifyReviewRequest(userId, booking) {
  return createNotification(
    userId,
    'review_request',
    'Αξιολογήστε την εμπειρία σας',
    `Πώς ήταν η κράτηση #${booking.bookingNumber}; Αφήστε μας μια αξιολόγηση!`,
    booking._id
  );
}

export async function notifyLoyaltyMilestone(userId, newTier) {
  const TIER_NAMES = { silver: 'Αργυρό', gold: 'Χρυσό', platinum: 'Platinum' };
  return createNotification(
    userId,
    'loyalty_milestone',
    'Νέο Επίπεδο Loyalty!',
    `Συγχαρητήρια! Αναβαθμιστήκατε σε ${TIER_NAMES[newTier] || newTier} Μέλος!`
  );
}
