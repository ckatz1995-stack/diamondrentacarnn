import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { generateVoucher, generateInvoice } from '../services/pdfService.js';

const router = express.Router();

router.get('/bookings/:id/voucher', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    const pdf = await generateVoucher(booking, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="voucher-${booking.bookingNumber}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  } catch (err) { next(err); }
});

router.get('/bookings/:id/invoice', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user._id });
    if (!booking) return res.status(404).json({ ok: false, error: 'not_found', message: 'Κράτηση δεν βρέθηκε' });
    const pdf = await generateInvoice(booking, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${booking.bookingNumber}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  } catch (err) { next(err); }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      memberId: req.user._id,
      status: { $in: ['Confirmed', 'Active', 'Completed'] },
    }).sort({ pickupDateTime: -1 });

    res.json({
      ok: true,
      documents: bookings.map(b => ({
        bookingId: b._id,
        bookingNumber: b.bookingNumber,
        vehicleName: b.vehicleName,
        pickupDateTime: b.pickupDateTime,
        dropoffDateTime: b.dropoffDateTime,
        totalPrice: b.totalPrice,
        status: b.status,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
