import mongoose from 'mongoose';

let counter = 0;

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, unique: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleName: String,
  categoryId: String,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Active', 'Completed', 'Canceled'],
    default: 'Confirmed',
  },
  pickupDateTime: { type: Date, required: true },
  dropoffDateTime: { type: Date, required: true },
  pickupLocation: String,
  dropoffLocation: String,
  extras: [{
    name: String,
    price: Number,
    _id: false,
  }],
  insurance: String,
  driverAge: String,
  totalPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  notes: String,
  cancellationReason: String,
  memberRating: { type: Number, min: 1, max: 5 },
  memberReview: String,
  promoCode: String,
  discountAmount: { type: Number, default: 0 },
  invoiceUrl: String,
  rentalAgreementUrl: String,
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsRedeemed: { type: Number, default: 0 },
  staffNotes: String,
}, { timestamps: true });

bookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const year = new Date().getFullYear();
    counter++;
    const pad = String(counter).padStart(4, '0');
    this.bookingNumber = `DRC-${year}-${pad}`;
  }
  next();
});

bookingSchema.index({ memberId: 1, status: 1 });
bookingSchema.index({ pickupDateTime: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
