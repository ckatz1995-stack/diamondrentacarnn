import express from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { awardPoints, computeTier, updateTierFromRentals } from '../services/loyaltyService.js';
import { sendSupportReply } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(requireAdmin);

const editMemberSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  isAdmin: z.boolean().optional(),
  loyaltyPoints: z.number().int().min(0).optional(),
  loyaltyTier: z.enum(['new', 'silver', 'gold', 'platinum']).optional(),
  totalCompletedRentals: z.number().int().min(0).optional(),
  bonusPoints: z.number().int().optional(),
  bonusDescription: z.string().optional(),
});

const editBookingSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Active', 'Completed', 'Canceled']).optional(),
  pickupDateTime: z.string().datetime().optional(),
  dropoffDateTime: z.string().datetime().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  totalPrice: z.number().min(0).optional(),
  staffNotes: z.string().optional(),
  vehicleName: z.string().optional(),
  insurance: z.string().optional(),
});

const broadcastSchema = z.object({
  type: z.enum(['booking_confirmed', 'booking_changed', 'trip_reminder', 'review_request',
                'loyalty_milestone', 'promo', 'support_reply']),
  title: z.string().min(1),
  body: z.string().min(1),
  tier: z.enum(['new', 'silver', 'gold', 'platinum']).optional(),
  userIds: z.array(z.string()).optional(),
});

const ticketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
});

const staffReplySchema = z.object({
  body: z.string().min(1),
});

const staffReviewReplySchema = z.object({
  staffResponse: z.string().min(1).max(1000),
});

// GET /api/admin/members
router.get('/members', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, tier, isAdmin } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }
    if (tier) filter.loyaltyTier = tier;
    if (isAdmin !== undefined) filter.isAdmin = isAdmin === 'true';

    const [members, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshTokens -emailVerifyToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      members,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/members/:id
router.get('/members/:id', async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id)
      .select('-passwordHash -refreshTokens -emailVerifyToken -resetPasswordToken')
      .lean();

    if (!member) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Μέλος δεν βρέθηκε' });
    }

    const [bookings, tickets] = await Promise.all([
      Booking.find({ memberId: member._id }).sort({ pickupDateTime: -1 }).limit(10).lean(),
      SupportTicket.find({ userId: member._id }).sort({ updatedAt: -1 }).limit(5).select('-messages').lean(),
    ]);

    res.json({ ok: true, member, recentBookings: bookings, recentTickets: tickets });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/members/:id
router.patch('/members/:id', validate(editMemberSchema), async (req, res, next) => {
  try {
    const { bonusPoints, bonusDescription, loyaltyPoints, totalCompletedRentals, ...rest } = req.body;
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Μέλος δεν βρέθηκε' });
    }

    // Handle manual bonus points
    if (bonusPoints && bonusPoints !== 0) {
      await awardPoints(member._id, null, Math.abs(bonusPoints), bonusPoints > 0 ? 'bonus' : 'redeemed',
        bonusDescription || `Manual adjustment by admin`);
    }

    const updates = { ...rest };
    if (loyaltyPoints !== undefined) updates.loyaltyPoints = loyaltyPoints;
    if (totalCompletedRentals !== undefined) {
      updates.totalCompletedRentals = totalCompletedRentals;
      if (!rest.loyaltyTier) updates.loyaltyTier = computeTier(totalCompletedRentals);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-passwordHash -refreshTokens -emailVerifyToken -resetPasswordToken');

    logger.info('Admin updated member', { adminId: req.user._id, memberId: req.params.id });

    res.json({ ok: true, member: updated, message: 'Το μέλος ενημερώθηκε' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, memberId, fromDate, toDate, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};

    if (status) filter.status = status;
    if (memberId) filter.memberId = memberId;
    if (fromDate || toDate) {
      filter.pickupDateTime = {};
      if (fromDate) filter.pickupDateTime.$gte = new Date(fromDate);
      if (toDate) filter.pickupDateTime.$lte = new Date(toDate);
    }
    if (search) {
      filter.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { vehicleName: { $regex: search, $options: 'i' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('memberId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      bookings,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/bookings/:id
router.patch('/bookings/:id', validate(editBookingSchema), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    }

    const prevStatus = booking.status;
    Object.assign(booking, req.body);
    await booking.save();

    // If booking just completed, update member stats
    if (prevStatus !== 'Completed' && booking.status === 'Completed') {
      const member = await User.findById(booking.memberId);
      if (member) {
        const newRentals = member.totalCompletedRentals + 1;
        const newTier = computeTier(newRentals);
        const oldTier = member.loyaltyTier;

        await User.findByIdAndUpdate(booking.memberId, {
          totalCompletedRentals: newRentals,
          loyaltyTier: newTier,
          $inc: { totalSpend: booking.totalPrice || 0 },
        });

        // Award loyalty points
        await awardPoints(booking.memberId, booking._id, booking.totalPrice, 'earned',
          `Πόντοι από κράτηση #${booking.bookingNumber}`);
      }
    }

    logger.info('Admin updated booking', { adminId: req.user._id, bookingId: req.params.id, status: booking.status });

    res.json({ ok: true, booking, message: 'Η κράτηση ενημερώθηκε' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/bookings/:id/reply-review
router.post('/bookings/:id/reply-review', validate(staffReviewReplySchema), async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate(
      { bookingId: req.params.id },
      { staffResponse: req.body.staffResponse },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Αξιολόγηση δεν βρέθηκε' });
    }

    res.json({ ok: true, review, message: 'Η απάντηση προστέθηκε' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/tickets
router.get('/tickets', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('bookingId', 'bookingNumber')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-messages')
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      tickets,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/tickets/:id/reply
router.post('/tickets/:id/reply', validate(staffReplySchema), async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Αίτημα δεν βρέθηκε' });
    }

    ticket.messages.push({ sender: 'staff', body: req.body.body });
    if (ticket.status === 'open') ticket.status = 'in_progress';
    await ticket.save();

    // Notify member
    await createNotification(
      ticket.userId,
      'support_reply',
      'Απάντηση στο αίτημά σας',
      `Η ομάδα υποστήριξης απάντησε στο αίτημα: "${ticket.subject}"`
    );

    // Send email
    const user = await User.findById(ticket.userId).lean();
    if (user) sendSupportReply(user, ticket).catch(() => {});

    logger.info('Admin replied to ticket', { adminId: req.user._id, ticketId: ticket._id });

    res.json({ ok: true, ticket, message: 'Η απάντηση στάλθηκε' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/tickets/:id/status
router.patch('/tickets/:id/status', validate(ticketStatusSchema), async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Αίτημα δεν βρέθηκε' });
    }

    const statusLabels = { open: 'Ανοιχτό', in_progress: 'Σε εξέλιξη', resolved: 'Επιλύθηκε', closed: 'Κλειστό' };
    logger.info('Admin changed ticket status', { adminId: req.user._id, ticketId: ticket._id, status: ticket.status });

    res.json({ ok: true, ticket, message: `Κατάσταση αιτήματος: ${statusLabels[ticket.status]}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      newMembersThisMonth,
      totalBookings,
      bookingsThisMonth,
      activeBookings,
      completedBookings,
      canceledBookings,
      openTickets,
      totalRevenueResult,
      monthRevenueResult,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      User.countDocuments({ isAdmin: false, createdAt: { $gte: startOfMonth } }),
      Booking.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.countDocuments({ status: 'Active' }),
      Booking.countDocuments({ status: 'Completed' }),
      Booking.countDocuments({ status: 'Canceled' }),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Booking.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.aggregate([
        { $match: { status: 'Completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const tierCounts = await User.aggregate([
      { $match: { isAdmin: false } },
      { $group: { _id: '$loyaltyTier', count: { $sum: 1 } } },
    ]);

    const tierBreakdown = { new: 0, silver: 0, gold: 0, platinum: 0 };
    tierCounts.forEach(t => { tierBreakdown[t._id] = t.count; });

    res.json({
      ok: true,
      stats: {
        members: { total: totalMembers, newThisMonth: newMembersThisMonth, tierBreakdown },
        bookings: {
          total: totalBookings,
          thisMonth: bookingsThisMonth,
          active: activeBookings,
          completed: completedBookings,
          canceled: canceledBookings,
        },
        revenue: {
          total: Math.round((totalRevenueResult[0]?.total || 0) * 100) / 100,
          thisMonth: Math.round((monthRevenueResult[0]?.total || 0) * 100) / 100,
        },
        support: { openTickets },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/notifications/broadcast
router.post('/notifications/broadcast', validate(broadcastSchema), async (req, res, next) => {
  try {
    const { type, title, body, tier, userIds } = req.body;

    let targetUsers;
    if (userIds && userIds.length > 0) {
      targetUsers = await User.find({ _id: { $in: userIds }, isAdmin: false }).select('_id').lean();
    } else if (tier) {
      targetUsers = await User.find({ loyaltyTier: tier, isAdmin: false }).select('_id').lean();
    } else {
      targetUsers = await User.find({ isAdmin: false }).select('_id').lean();
    }

    const notifications = targetUsers.map(u => ({
      userId: u._id,
      type,
      title,
      body,
    }));

    await Notification.insertMany(notifications);

    logger.info('Admin broadcast notification', {
      adminId: req.user._id,
      type,
      recipientCount: notifications.length,
    });

    res.json({
      ok: true,
      sentTo: notifications.length,
      message: `Η ειδοποίηση στάλθηκε σε ${notifications.length} χρήστες`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
