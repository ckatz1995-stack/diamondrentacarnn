import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  device: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const secondaryDriverSchema = new mongoose.Schema({
  name: String,
  license: String,
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  avatarUrl: String,
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  refreshTokens: [refreshTokenSchema],
  driverAge: { type: String, enum: ['19-22', '23-69', '70+'] },
  nationality: String,
  licenseNumber: String,
  licenseExpiry: String,
  licensePhotoUrl: String,
  secondaryDrivers: [secondaryDriverSchema],
  preferredPickupLocation: String,
  language: { type: String, enum: ['el', 'en'], default: 'el' },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ['new', 'silver', 'gold', 'platinum'], default: 'new' },
  totalCompletedRentals: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  notificationPrefs: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
  },
  isAdmin: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ loyaltyTier: 1 });

export const User = mongoose.model('User', userSchema);
