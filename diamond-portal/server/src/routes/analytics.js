import express from 'express';
import { Booking } from '../models/Booking.js';

const router = express.Router();

const CO2_KG_PER_DAY = 0.21 * 200; // 0.21 kg/km * avg 200km/day = 42 kg/day

// GET /api/analytics — unified endpoint used by the frontend
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { memberId: req.user._id };
    if (startDate || endDate) {
      filter.pickupDateTime = {};
      if (startDate) filter.pickupDateTime.$gte = new Date(startDate);
      if (endDate) filter.pickupDateTime.$lte = new Date(endDate);
    }

    const allBookings = await Booking.find(filter).lean();
    const completed = allBookings.filter(b => b.status === 'Completed');
    const now = new Date();

    // Summary
    const totalSpend = completed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalDays = completed.reduce((sum, b) => {
      const days = Math.ceil((new Date(b.dropoffDateTime) - new Date(b.pickupDateTime)) / 86400000);
      return sum + (isNaN(days) ? 0 : days);
    }, 0);

    // Monthly spend — last 12 months
    const monthlyMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyMap[key] = { month: d.getMonth() + 1, year: d.getFullYear(), amount: 0 };
    }
    completed.forEach(b => {
      const d = new Date(b.pickupDateTime);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (monthlyMap[key]) monthlyMap[key].amount += b.totalPrice || 0;
    });
    const monthlySpend = Object.values(monthlyMap).map(m => ({
      ...m,
      amount: Math.round(m.amount * 100) / 100,
    }));

    // Category breakdown
    const categoryMap = {};
    completed.forEach(b => {
      const cat = b.categoryId || 'Άλλο';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Top pickup locations (excl. canceled)
    const locationMap = {};
    allBookings.filter(b => b.status !== 'Canceled').forEach(b => {
      const loc = b.pickupLocation || 'Άγνωστη';
      if (!locationMap[loc]) locationMap[loc] = { location: loc, count: 0, totalSpend: 0 };
      locationMap[loc].count++;
      locationMap[loc].totalSpend += b.totalPrice || 0;
    });
    const topLocations = Object.values(locationMap)
      .map(l => ({ ...l, totalSpend: Math.round(l.totalSpend * 100) / 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      ok: true,
      analytics: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalDays,
        totalTrips: completed.length,
        co2Kg: Math.round(totalDays * CO2_KG_PER_DAY),
        upcomingBookings: allBookings.filter(b =>
          ['Confirmed', 'Pending'].includes(b.status) && new Date(b.pickupDateTime) > now
        ).length,
        canceledBookings: allBookings.filter(b => b.status === 'Canceled').length,
        monthlySpend,
        categoryBreakdown,
        topLocations,
      },
    });
  } catch (err) {
    next(err);
  }
});


  try {
    const bookings = await Booking.find({ memberId: req.user._id }).lean();

    const completed = bookings.filter(b => b.status === 'Completed');
    const totalSpend = completed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const totalDays = completed.reduce((sum, b) => {
      const days = Math.ceil((new Date(b.dropoffDateTime) - new Date(b.pickupDateTime)) / 86400000);
      return sum + (isNaN(days) ? 0 : days);
    }, 0);

    const co2Kg = totalDays * CO2_KG_PER_DAY;

    const upcoming = bookings.filter(b =>
      ['Confirmed', 'Pending'].includes(b.status) && new Date(b.pickupDateTime) > new Date()
    ).length;

    const canceled = bookings.filter(b => b.status === 'Canceled').length;

    res.json({
      ok: true,
      summary: {
        totalTrips: completed.length,
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalDaysRented: totalDays,
        co2KgEstimate: Math.round(co2Kg),
        upcomingBookings: upcoming,
        canceledBookings: canceled,
        totalBookings: bookings.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/spend
router.get('/spend', async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${Number(year) + 1}-01-01`);

    const bookings = await Booking.find({
      memberId: req.user._id,
      status: 'Completed',
      pickupDateTime: { $gte: startDate, $lt: endDate },
    }).lean();

    // Group by month
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString('el-GR', { month: 'long' }),
      spend: 0,
      trips: 0,
    }));

    bookings.forEach(b => {
      const month = new Date(b.pickupDateTime).getMonth();
      monthly[month].spend += b.totalPrice || 0;
      monthly[month].trips++;
    });

    monthly.forEach(m => { m.spend = Math.round(m.spend * 100) / 100; });

    res.json({ ok: true, year: Number(year), monthly });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/vehicles
router.get('/vehicles', async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      memberId: req.user._id,
      status: { $in: ['Completed', 'Active'] },
    }).lean();

    const categoryMap = {};
    bookings.forEach(b => {
      const cat = b.categoryId || 'Unknown';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { categoryId: cat, trips: 0, spend: 0, days: 0 };
      }
      categoryMap[cat].trips++;
      categoryMap[cat].spend += b.totalPrice || 0;
      const days = Math.ceil((new Date(b.dropoffDateTime) - new Date(b.pickupDateTime)) / 86400000);
      categoryMap[cat].days += isNaN(days) ? 0 : days;
    });

    const categories = Object.values(categoryMap).map(c => ({
      ...c,
      spend: Math.round(c.spend * 100) / 100,
    })).sort((a, b) => b.trips - a.trips);

    res.json({ ok: true, categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/locations
router.get('/locations', async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      memberId: req.user._id,
      status: { $in: ['Completed', 'Active', 'Confirmed'] },
    }).lean();

    const locationMap = {};
    bookings.forEach(b => {
      const loc = b.pickupLocation || 'Άγνωστη';
      if (!locationMap[loc]) locationMap[loc] = { location: loc, count: 0 };
      locationMap[loc].count++;
    });

    const locations = Object.values(locationMap).sort((a, b) => b.count - a.count);

    res.json({ ok: true, locations });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/export
router.get('/export', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ memberId: req.user._id })
      .sort({ pickupDateTime: -1 })
      .lean();

    const headers = [
      'Αριθμός Κράτησης',
      'Κατάσταση',
      'Όχημα',
      'Κατηγορία',
      'Παραλαβή',
      'Επιστροφή',
      'Τοποθεσία Παραλαβής',
      'Τοποθεσία Επιστροφής',
      'Σύνολο (EUR)',
      'Ημέρες',
      'Loyalty Πόντοι',
    ];

    const rows = bookings.map(b => {
      const days = Math.ceil((new Date(b.dropoffDateTime) - new Date(b.pickupDateTime)) / 86400000);
      return [
        b.bookingNumber || '',
        b.status || '',
        (b.vehicleName || '').replace(/,/g, ' '),
        b.categoryId || '',
        b.pickupDateTime ? new Date(b.pickupDateTime).toISOString() : '',
        b.dropoffDateTime ? new Date(b.dropoffDateTime).toISOString() : '',
        (b.pickupLocation || '').replace(/,/g, ' '),
        (b.dropoffLocation || '').replace(/,/g, ' '),
        b.totalPrice || 0,
        isNaN(days) ? 0 : days,
        b.loyaltyPointsEarned || 0,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="diamond-bookings-export.csv"',
    });
    res.send('﻿' + csv); // BOM for Excel UTF-8
  } catch (err) {
    next(err);
  }
});

export default router;
