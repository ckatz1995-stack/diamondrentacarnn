import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { type: String, enum: ['earned', 'redeemed', 'bonus', 'expired'], required: true },
  points: { type: Number, required: true },
  description: String,
}, { timestamps: true });

export const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
