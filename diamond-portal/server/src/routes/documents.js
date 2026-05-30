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

// Voucher list — all non-canceled bookings that have a booking number
router.get('/vouchers', requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      memberId: req.user._id,
      status: { $in: ['Confirmed', 'Active', 'Completed'] },
    }).sort({ pickupDateTime: -1 }).lean();

    res.json({
      ok: true,
      vouchers: bookings.map(b => ({
        _id: b._id,
        bookingId: b._id,
        bookingNumber: b.bookingNumber,
        vehicle: b.vehicleName,
        date: b.pickupDateTime,
        status: b.status,
      })),
    });
  } catch (err) { next(err); }
});

// Invoice list — completed bookings only
router.get('/invoices', requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      memberId: req.user._id,
      status: 'Completed',
    }).sort({ dropoffDateTime: -1 }).lean();

    res.json({
      ok: true,
      invoices: bookings.map(b => ({
        _id: b._id,
        bookingId: b._id,
        bookingNumber: b.bookingNumber,
        invoiceNumber: `INV-${b.bookingNumber}`,
        vehicle: b.vehicleName,
        date: b.dropoffDateTime || b.updatedAt,
        totalPrice: b.totalPrice,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
