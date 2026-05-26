import express from 'express';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const { unreadOnly, limit = 30, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    res.json({
      ok: true,
      notifications,
      unreadCount,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Η ειδοποίηση δεν βρέθηκε' });
    }

    res.json({ ok: true, notification });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ ok: true, updatedCount: result.modifiedCount, message: 'Όλες οι ειδοποιήσεις επισημάνθηκαν ως αναγνωσμένες' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Η ειδοποίηση δεν βρέθηκε' });
    }

    res.json({ ok: true, message: 'Η ειδοποίηση διαγράφηκε' });
  } catch (err) {
    next(err);
  }
});

export default router;
