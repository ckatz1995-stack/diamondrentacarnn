import express from 'express';
import { z } from 'zod';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { validate } from '../middleware/validate.js';
import { awardPoints } from '../services/loyaltyService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const reviewSchema = z.object({
  bookingId: z.string().min(1, 'Απαιτείται κράτηση'),
  vehicleRating: z.number().int().min(1).max(5),
  serviceRating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const editReviewSchema = z.object({
  vehicleRating: z.number().int().min(1).max(5).optional(),
  serviceRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews
router.post('/', validate(reviewSchema), async (req, res, next) => {
  try {
    const { bookingId, vehicleRating, serviceRating, comment } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, memberId: req.user._id, status: 'Completed' });
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Η κράτηση δεν βρέθηκε ή δεν έχει ολοκληρωθεί' });
    }

    const existing = await Review.findOne({ bookingId, userId: req.user._id });
    if (existing) {
      return res.status(409).json({ ok: false, error: 'already_reviewed', message: 'Έχετε ήδη αξιολογήσει αυτή την κράτηση' });
    }

    const review = await Review.create({
      bookingId,
      userId: req.user._id,
      vehicleRating,
      serviceRating,
      comment,
    });

    // Award 10 loyalty points for review
    await awardPoints(req.user._id, bookingId, 100, 'bonus', 'Bonus για αξιολόγηση κράτησης');

    // Update booking with review reference
    await Booking.findByIdAndUpdate(bookingId, { memberRating: review.overallRating, memberReview: comment });

    logger.info('Review submitted', { userId: req.user._id, bookingId, overallRating: review.overallRating });

    res.status(201).json({ ok: true, review, message: 'Η αξιολόγηση υποβλήθηκε. Κερδίσατε 10 πόντους loyalty!' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reviews/:id
router.patch('/:id', validate(editReviewSchema), async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Αξιολόγηση δεν βρέθηκε' });
    }

    // Allow edit within 48 hours
    const hoursOld = (Date.now() - new Date(review.createdAt)) / 3600000;
    if (hoursOld > 48) {
      return res.status(403).json({ ok: false, error: 'edit_window_closed', message: 'Δεν μπορείτε να τροποποιήσετε αξιολόγηση μετά από 48 ώρες' });
    }

    if (req.body.vehicleRating !== undefined) review.vehicleRating = req.body.vehicleRating;
    if (req.body.serviceRating !== undefined) review.serviceRating = req.body.serviceRating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();

    res.json({ ok: true, review, message: 'Η αξιολόγηση ενημερώθηκε' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Αξιολόγηση δεν βρέθηκε' });
    }

    const hoursOld = (Date.now() - new Date(review.createdAt)) / 3600000;
    if (hoursOld > 48) {
      return res.status(403).json({ ok: false, error: 'delete_window_closed', message: 'Δεν μπορείτε να διαγράψετε αξιολόγηση μετά από 48 ώρες' });
    }

    await Review.findByIdAndDelete(review._id);
    await Booking.findByIdAndUpdate(review.bookingId, { $unset: { memberRating: '', memberReview: '' } });

    res.json({ ok: true, message: 'Η αξιολόγηση διαγράφηκε' });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/my
router.get('/my', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ userId: req.user._id })
        .populate('bookingId', 'bookingNumber vehicleName pickupDateTime dropoffDateTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      ok: true,
      reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
