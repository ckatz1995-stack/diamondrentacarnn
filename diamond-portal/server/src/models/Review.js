import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleRating: { type: Number, min: 1, max: 5, required: true },
  serviceRating: { type: Number, min: 1, max: 5, required: true },
  overallRating: { type: Number, min: 1, max: 5 },
  comment: String,
  staffResponse: String,
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.pre('save', function (next) {
  this.overallRating = Math.round((this.vehicleRating + this.serviceRating) / 2);
  next();
});

export const Review = mongoose.model('Review', reviewSchema);
