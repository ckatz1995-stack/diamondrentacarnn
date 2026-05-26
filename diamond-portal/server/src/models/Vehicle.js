import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  type: String,
  transmission: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
  seats: Number,
  luggageSmall: Number,
  luggageLarge: Number,
  fuelType: { type: String, enum: ['petrol', 'diesel', 'hybrid', 'electric'], default: 'petrol' },
  ac: { type: Boolean, default: true },
  pricePerDay: { type: Number, required: true },
  imageUrl: String,
  isAvailable: { type: Boolean, default: true },
  specs: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
