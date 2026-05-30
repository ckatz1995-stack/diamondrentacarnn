import express from 'express';
import { env } from '../config/env.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /api/sync/wix-booking
// Called by Wix bookingEngine after every successful insert.
// Upserts the booking in MongoDB and links it to a portal member if email matches.
router.post('/wix-booking', async (req, res, next) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const {
      bookingNumber, wixId, email, customerName, customerPhone,
      vehicleName, categoryId,
      pickupDateTime, dropoffDateTime,
      pickupLocation, dropoffLocation,
      insurance, driverAge,
      totalPrice, status, notes, extras,
    } = req.body;

    if (!bookingNumber || !pickupDateTime || !dropoffDateTime) {
      return res.status(400).json({ ok: false, error: 'missing_required_fields' });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    // Attempt to link to an existing portal member
    const member = normalizedEmail
      ? await User.findOne({ email: normalizedEmail }).select('_id').lean()
      : null;

    await Booking.findOneAndUpdate(
      { bookingNumber },
      {
        $set: {
          source: 'wix',
          ...(wixId && { wixId }),
          ...(member && { memberId: member._id }),
          ...(normalizedEmail && { customerEmail: normalizedEmail }),
          ...(customerName && { customerName }),
          ...(customerPhone && { customerPhone }),
          ...(vehicleName && { vehicleName }),
          ...(categoryId && { categoryId }),
          pickupDateTime: new Date(pickupDateTime),
          dropoffDateTime: new Date(dropoffDateTime),
          ...(pickupLocation && { pickupLocation }),
          ...(dropoffLocation && { dropoffLocation }),
          ...(insurance && { insurance }),
          ...(driverAge && { driverAge }),
          totalPrice: Number(totalPrice) || 0,
          status: status || 'Pending',
          ...(notes && { notes }),
          extras: Array.isArray(extras)
            ? extras.map(e => ({ name: String(e.name || ''), price: Number(e.price) || 0 }))
            : [],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info('Wix booking synced to portal', {
      bookingNumber,
      email: normalizedEmail,
      linked: !!member,
    });

    res.json({ ok: true, bookingNumber, linked: !!member });
  } catch (err) {
    next(err);
  }
});

export default router;
