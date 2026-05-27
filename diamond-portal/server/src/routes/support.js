import express from 'express';
import { z } from 'zod';
import { SupportTicket } from '../models/SupportTicket.js';
import { validate } from '../middleware/validate.js';
import { createNotification } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const createTicketSchema = z.object({
  subject: z.string().min(3, 'Το θέμα πρέπει να έχει τουλάχιστον 3 χαρακτήρες').max(200),
  category: z.enum(['general', 'booking', 'billing', 'damage', 'complaint']).default('general'),
  body: z.string().min(10, 'Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες').max(5000),
  bookingId: z.string().optional(),
});

const replySchema = z.object({
  body: z.string().min(1, 'Απαιτείται μήνυμα').max(5000),
});

// POST /api/support/tickets
router.post('/tickets', validate(createTicketSchema), async (req, res, next) => {
  try {
    const { subject, category, body, bookingId } = req.body;

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      bookingId: bookingId || undefined,
      subject,
      category,
      messages: [{ sender: 'member', body }],
    });

    logger.info('Support ticket created', { userId: req.user._id, ticketId: ticket._id, category });

    res.status(201).json({ ok: true, ticket, message: 'Το αίτημά σας υποβλήθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/support/tickets
router.get('/tickets', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-messages')
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    const statusLabels = { open: 'Ανοιχτό', in_progress: 'Σε εξέλιξη', resolved: 'Επιλύθηκε', closed: 'Κλειστό' };
    const categoryLabels = { general: 'Γενικό', booking: 'Κράτηση', billing: 'Χρέωση', damage: 'Ζημιά', complaint: 'Παράπονο' };

    res.json({
      ok: true,
      tickets: tickets.map(t => ({
        ...t,
        statusLabel: statusLabels[t.status],
        categoryLabel: categoryLabels[t.category],
      })),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/support/tickets/:id
router.get('/tickets/:id', async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('bookingId', 'bookingNumber vehicleName pickupDateTime')
      .lean();

    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Το αίτημα δεν βρέθηκε' });
    }

    res.json({ ok: true, ticket });
  } catch (err) {
    next(err);
  }
});

// POST /api/support/tickets/:id/reply
router.post('/tickets/:id/reply', validate(replySchema), async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Το αίτημα δεν βρέθηκε' });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({ ok: false, error: 'ticket_closed', message: 'Δεν μπορείτε να απαντήσετε σε κλειστό αίτημα' });
    }

    ticket.messages.push({ sender: 'member', body: req.body.body });
    if (ticket.status === 'resolved') ticket.status = 'open';
    await ticket.save();

    res.json({ ok: true, ticket, message: 'Η απάντησή σας στάλθηκε' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/support/tickets/:id/close
router.patch('/tickets/:id/close', async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Το αίτημα δεν βρέθηκε' });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({ ok: false, error: 'already_closed', message: 'Το αίτημα είναι ήδη κλειστό' });
    }

    ticket.status = 'closed';
    await ticket.save();

    res.json({ ok: true, ticket, message: 'Το αίτημα έκλεισε' });
  } catch (err) {
    next(err);
  }
});

export default router;
