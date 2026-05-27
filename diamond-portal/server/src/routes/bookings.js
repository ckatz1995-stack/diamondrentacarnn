import express from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { cancellationPolicy } from '../utils/dateUtils.js';
import { checkAvailability, invalidateCache } from '../services/availabilityService.js';
import { awardPoints, updateTierFromRentals, computeTier } from '../services/loyaltyService.js';
import {
  notifyBookingConfirmed,
  notifyBookingChanged,
} from '../services/notificationService.js';
import {
  sendBookingConfirmation,
  sendBookingChanged,
  sendBookingCanceled,
} from '../services/emailService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const editSchema = z.object({
  pickupDateTime: z.string().datetime().optional(),
  dropoffDateTime: z.string().datetime().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  notes: z.string().optional(),
  insurance: z.string().optional(),
  driverAge: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Τουλάχιστον ένα πεδίο απαιτείται' });

const extendSchema = z.object({
  newDropoffDateTime: z.string().datetime({ message: 'Μη έγκυρη ημερομηνία' }),
});

const extraSchema = z.object({
  name: z.string().min(1, 'Απαιτείται όνομα extra'),
  price: z.number().min(0, 'Η τιμή δεν μπορεί να είναι αρνητική'),
});

const promoSchema = z.object({
  promoCode: z.string().min(1, 'Απαιτείται κωδικός'),
});

// GET /api/bookings
router.get('/', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'pickupDateTime', order = 'desc' } = req.query;
    const filter = { memberId: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const sortDir = order === 'asc' ? 1 : -1;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id })
      .populate('vehicleId', 'name categoryId transmission seats fuelType imageUrl')
      .lean();

    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    const policy = cancellationPolicy(booking.pickupDateTime);

    res.json({ ok: true, booking, cancellationPolicy: policy });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id
router.patch('/:id', validate(editSchema), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'invalid_status', message: 'Η κράτηση δεν μπορεί να τροποποιηθεί σε αυτή την κατάσταση' });
    }

    const policy = cancellationPolicy(booking.pickupDateTime);
    if (!policy.canCancel) {
      return res.status(400).json({ ok: false, error: 'past_booking', message: 'Η κράτηση έχει παρέλθει' });
    }

    const changes = {};
    const allowedFields = ['pickupDateTime', 'dropoffDateTime', 'pickupLocation', 'dropoffLocation', 'notes', 'insurance', 'driverAge'];
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined && String(booking[f]) !== String(req.body[f])) {
        changes[f] = req.body[f];
      }
    });

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ ok: false, error: 'no_changes', message: 'Δεν υπάρχουν αλλαγές να αποθηκευτούν' });
    }

    // If dates changed, check availability
    if (changes.pickupDateTime || changes.dropoffDateTime) {
      const newPickup = changes.pickupDateTime || booking.pickupDateTime;
      const newDropoff = changes.dropoffDateTime || booking.dropoffDateTime;
      if (new Date(newPickup) >= new Date(newDropoff)) {
        return res.status(400).json({ ok: false, error: 'invalid_dates', message: 'Η ημερομηνία παραλαβής πρέπει να είναι πριν την επιστροφή' });
      }
      const avail = await checkAvailability(booking.categoryId, newPickup, newDropoff, booking._id);
      if (!avail.available) {
        return res.status(409).json({ ok: false, error: 'not_available', message: 'Δεν υπάρχει διαθεσιμότητα για τις νέες ημερομηνίες' });
      }
    }

    Object.assign(booking, changes);
    await booking.save();

    invalidateCache(booking.categoryId);

    const user = await User.findById(req.user._id).lean();
    const changeLabels = {};
    if (changes.pickupDateTime) changeLabels['Ημερ. Παραλαβής'] = changes.pickupDateTime;
    if (changes.dropoffDateTime) changeLabels['Ημερ. Επιστροφής'] = changes.dropoffDateTime;
    if (changes.pickupLocation) changeLabels['Τοποθεσία Παραλαβής'] = changes.pickupLocation;
    if (changes.dropoffLocation) changeLabels['Τοποθεσία Επιστροφής'] = changes.dropoffLocation;

    notifyBookingChanged(req.user._id, booking).catch(() => {});
    sendBookingChanged(user, booking, changeLabels).catch(() => {});

    res.json({ ok: true, booking });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id  (cancel)
router.delete('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    if (['Canceled', 'Completed'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'invalid_status', message: 'Η κράτηση δεν μπορεί να ακυρωθεί' });
    }

    const policy = cancellationPolicy(booking.pickupDateTime);
    if (!policy.canCancel) {
      return res.status(400).json({ ok: false, error: 'cannot_cancel', message: policy.label });
    }

    const reason = req.body?.reason || 'Ακύρωση από μέλος';
    booking.status = 'Canceled';
    booking.cancellationReason = reason;
    await booking.save();

    invalidateCache(booking.categoryId);

    const user = await User.findById(req.user._id).lean();
    sendBookingCanceled(user, booking).catch(() => {});

    res.json({ ok: true, booking, refundPolicy: policy, message: `Η κράτηση ακυρώθηκε. ${policy.label}` });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/extend
router.post('/:id/extend', validate(extendSchema), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    if (!['Confirmed', 'Active'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'invalid_status', message: 'Η κράτηση δεν μπορεί να παραταθεί σε αυτή την κατάσταση' });
    }

    const { newDropoffDateTime } = req.body;
    if (new Date(newDropoffDateTime) <= new Date(booking.dropoffDateTime)) {
      return res.status(400).json({ ok: false, error: 'invalid_date', message: 'Η νέα ημερομηνία επιστροφής πρέπει να είναι μεταγενέστερη' });
    }

    const avail = await checkAvailability(booking.categoryId, booking.dropoffDateTime, newDropoffDateTime, booking._id);
    if (!avail.available) {
      return res.status(409).json({ ok: false, error: 'not_available', message: 'Δεν υπάρχει διαθεσιμότητα για παράταση' });
    }

    const oldDropoff = new Date(booking.dropoffDateTime);
    booking.dropoffDateTime = new Date(newDropoffDateTime);

    // Recalculate price
    const extraDays = Math.ceil((new Date(newDropoffDateTime) - oldDropoff) / 86400000);
    const dayRate = booking.totalPrice / Math.ceil((oldDropoff - new Date(booking.pickupDateTime)) / 86400000);
    booking.totalPrice += dayRate * extraDays;

    await booking.save();
    invalidateCache(booking.categoryId);

    const user = await User.findById(req.user._id).lean();
    notifyBookingChanged(req.user._id, booking).catch(() => {});
    sendBookingChanged(user, booking, { 'Επιστροφή': newDropoffDateTime }).catch(() => {});

    res.json({ ok: true, booking, message: 'Η κράτηση παρατάθηκε επιτυχώς' });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/book-again
router.post('/:id/book-again', async (req, res, next) => {
  try {
    const original = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!original) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    const { pickupDateTime, dropoffDateTime, pickupLocation, dropoffLocation } = req.body;

    if (!pickupDateTime || !dropoffDateTime) {
      return res.status(422).json({ ok: false, error: 'validation_error', message: 'Απαιτούνται ημερομηνίες' });
    }

    if (new Date(pickupDateTime) >= new Date(dropoffDateTime)) {
      return res.status(400).json({ ok: false, error: 'invalid_dates', message: 'Μη έγκυρες ημερομηνίες' });
    }

    const avail = await checkAvailability(original.categoryId, pickupDateTime, dropoffDateTime);
    if (!avail.available) {
      return res.status(409).json({ ok: false, error: 'not_available', message: 'Δεν υπάρχει διαθεσιμότητα για τις επιλεγμένες ημερομηνίες' });
    }

    const days = Math.ceil((new Date(dropoffDateTime) - new Date(pickupDateTime)) / 86400000);
    const origDays = Math.ceil(
      (new Date(original.dropoffDateTime) - new Date(original.pickupDateTime)) / 86400000
    );
    const dayRate = origDays > 0 ? original.totalPrice / origDays : original.totalPrice;
    const newTotal = dayRate * days;

    const newBooking = await Booking.create({
      memberId: req.user._id,
      vehicleId: original.vehicleId,
      vehicleName: original.vehicleName,
      categoryId: original.categoryId,
      status: 'Confirmed',
      pickupDateTime,
      dropoffDateTime,
      pickupLocation: pickupLocation || original.pickupLocation,
      dropoffLocation: dropoffLocation || original.dropoffLocation,
      extras: original.extras,
      insurance: original.insurance,
      driverAge: original.driverAge,
      totalPrice: newTotal,
    });

    invalidateCache(original.categoryId);

    const user = await User.findById(req.user._id).lean();
    notifyBookingConfirmed(req.user._id, newBooking).catch(() => {});
    sendBookingConfirmation(user, newBooking).catch(() => {});

    res.status(201).json({ ok: true, booking: newBooking, message: 'Η νέα κράτηση δημιουργήθηκε επιτυχώς' });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/add-extra
router.post('/:id/add-extra', validate(extraSchema), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'invalid_status', message: 'Δεν μπορείτε να προσθέσετε extras σε αυτή την κατάσταση' });
    }

    const { name, price } = req.body;
    booking.extras.push({ name, price });
    booking.totalPrice += price;
    await booking.save();

    const user = await User.findById(req.user._id).lean();
    notifyBookingChanged(req.user._id, booking).catch(() => {});
    sendBookingChanged(user, booking, { 'Νέο Extra': name }).catch(() => {});

    res.json({ ok: true, booking, message: 'Το extra προστέθηκε επιτυχώς' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/promo
router.patch('/:id/promo', validate(promoSchema), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'invalid_status', message: 'Δεν μπορείτε να εφαρμόσετε κωδικό σε αυτή την κατάσταση' });
    }

    if (booking.promoCode) {
      return res.status(400).json({ ok: false, error: 'promo_used', message: 'Έχει ήδη εφαρμοστεί κωδικός' });
    }

    const { promoCode } = req.body;

    // Simple promo validation: DIAMOND10 = 10%, WELCOME5 = 5%, SUMMER20 = 20%
    const PROMOS = {
      DIAMOND10: { pct: 10 },
      WELCOME5: { pct: 5 },
      SUMMER20: { pct: 20 },
    };

    const promo = PROMOS[promoCode.toUpperCase()];
    if (!promo) {
      return res.status(400).json({ ok: false, error: 'invalid_promo', message: 'Μη έγκυρος κωδικός προσφοράς' });
    }

    const discount = Math.round((booking.totalPrice * promo.pct) / 100 * 100) / 100;
    booking.promoCode = promoCode.toUpperCase();
    booking.discountAmount = discount;
    booking.totalPrice = Math.max(0, booking.totalPrice - discount);
    await booking.save();

    res.json({ ok: true, booking, discount, message: `Εφαρμόστηκε έκπτωση ${promo.pct}%` });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id/availability-check
router.get('/:id/availability-check', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    const { pickupDateTime, dropoffDateTime } = req.query;
    if (!pickupDateTime || !dropoffDateTime) {
      return res.status(422).json({ ok: false, error: 'validation_error', message: 'Απαιτούνται ημερομηνίες' });
    }

    const avail = await checkAvailability(booking.categoryId, pickupDateTime, dropoffDateTime, booking._id);
    res.json({ ok: true, ...avail });
  } catch (err) {
    next(err);
  }
});

export default router;
