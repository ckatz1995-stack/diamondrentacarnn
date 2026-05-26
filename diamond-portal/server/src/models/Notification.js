import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['booking_confirmed', 'booking_changed', 'trip_reminder', 'review_request',
           'loyalty_milestone', 'promo', 'support_reply'],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
