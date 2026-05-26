import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config();

import { User } from './models/User.js';
import { Vehicle } from './models/Vehicle.js';
import { Booking } from './models/Booking.js';
import { Review } from './models/Review.js';
import { SupportTicket } from './models/SupportTicket.js';
import { Notification } from './models/Notification.js';
import { LoyaltyTransaction } from './models/LoyaltyTransaction.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diamond-portal';

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearCollections() {
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    SupportTicket.deleteMany({}),
    Notification.deleteMany({}),
    LoyaltyTransaction.deleteMany({}),
  ]);
  console.log('Collections cleared.');
}

async function seedUsers() {
  console.log('Seeding users...');

  const adminHash = await bcrypt.hash('Admin123!', 12);
  const memberHash = await bcrypt.hash('Member123!', 12);

  const admin = await User.create({
    email: 'admin@diamondrentacar.gr',
    passwordHash: adminHash,
    firstName: 'Admin',
    lastName: 'Diamond',
    phone: '+30 2310 000 000',
    isEmailVerified: true,
    isAdmin: true,
    loyaltyTier: 'platinum',
    loyaltyPoints: 999,
    totalCompletedRentals: 0,
    referralCode: 'ADMIN0001',
    language: 'el',
  });

  const member1 = await User.create({
    email: 'member1@test.gr',
    passwordHash: memberHash,
    firstName: 'Νίκος',
    lastName: 'Παπαδόπουλος',
    phone: '+30 6971 000 001',
    isEmailVerified: true,
    loyaltyTier: 'gold',
    loyaltyPoints: 340,
    totalCompletedRentals: 5,
    totalSpend: 1850,
    referralCode: 'NIKOS001',
    nationality: 'Ελληνική',
    licenseNumber: 'ΑΒ123456',
    licenseExpiry: '2029-06-30',
    driverAge: '23-69',
    preferredPickupLocation: 'Αεροδρόμιο Θεσσαλονίκης',
    language: 'el',
    notificationPrefs: { email: true, sms: false, inApp: true },
  });

  const member2 = await User.create({
    email: 'member2@test.gr',
    passwordHash: memberHash,
    firstName: 'Μαρία',
    lastName: 'Γεωργίου',
    phone: '+30 6972 000 002',
    isEmailVerified: true,
    loyaltyTier: 'silver',
    loyaltyPoints: 85,
    totalCompletedRentals: 2,
    totalSpend: 520,
    referralCode: 'MARIA002',
    nationality: 'Ελληνική',
    licenseNumber: 'ΓΔ789012',
    licenseExpiry: '2027-11-30',
    driverAge: '23-69',
    preferredPickupLocation: 'Κέντρο Θεσσαλονίκης',
    language: 'el',
    notificationPrefs: { email: true, sms: false, inApp: true },
  });

  const member3 = await User.create({
    email: 'member3@test.gr',
    passwordHash: memberHash,
    firstName: 'Γιώργος',
    lastName: 'Κωνσταντίνου',
    phone: '+30 6973 000 003',
    isEmailVerified: false,
    emailVerifyToken: 'test-verify-token-123',
    emailVerifyExpiry: daysFromNow(1),
    loyaltyTier: 'new',
    loyaltyPoints: 0,
    totalCompletedRentals: 0,
    totalSpend: 0,
    referralCode: 'GIORG003',
    referredBy: member1._id,
    nationality: 'Ελληνική',
    driverAge: '19-22',
    language: 'el',
    notificationPrefs: { email: true, sms: false, inApp: false },
  });

  console.log(`Created: admin, member1 (${member1.email}), member2 (${member2.email}), member3 (${member3.email})`);
  return { admin, member1, member2, member3 };
}

async function seedVehicles() {
  console.log('Seeding vehicles...');

  const vehicles = await Vehicle.insertMany([
    {
      name: 'Toyota Yaris',
      categoryId: 'economy',
      type: 'Hatchback',
      transmission: 'manual',
      seats: 5,
      luggageSmall: 2,
      luggageLarge: 1,
      fuelType: 'petrol',
      ac: true,
      pricePerDay: 35,
      isAvailable: true,
      specs: { engine: '1.0L', power: '72hp', consumption: '5.5L/100km' },
    },
    {
      name: 'Volkswagen Polo',
      categoryId: 'compact',
      type: 'Hatchback',
      transmission: 'automatic',
      seats: 5,
      luggageSmall: 2,
      luggageLarge: 1,
      fuelType: 'petrol',
      ac: true,
      pricePerDay: 48,
      isAvailable: true,
      specs: { engine: '1.0L TSI', power: '95hp', consumption: '5.8L/100km' },
    },
    {
      name: 'Toyota RAV4',
      categoryId: 'suv',
      type: 'SUV',
      transmission: 'automatic',
      seats: 5,
      luggageSmall: 3,
      luggageLarge: 2,
      fuelType: 'hybrid',
      ac: true,
      pricePerDay: 85,
      isAvailable: true,
      specs: { engine: '2.5L Hybrid', power: '218hp', consumption: '5.2L/100km' },
    },
    {
      name: 'Volkswagen Caravelle',
      categoryId: 'minivan',
      type: 'Minivan',
      transmission: 'automatic',
      seats: 9,
      luggageSmall: 4,
      luggageLarge: 3,
      fuelType: 'diesel',
      ac: true,
      pricePerDay: 120,
      isAvailable: true,
      specs: { engine: '2.0L TDI', power: '150hp', consumption: '7.8L/100km' },
    },
    {
      name: 'Mercedes-Benz E-Class',
      categoryId: 'luxury',
      type: 'Sedan',
      transmission: 'automatic',
      seats: 5,
      luggageSmall: 2,
      luggageLarge: 2,
      fuelType: 'diesel',
      ac: true,
      pricePerDay: 160,
      isAvailable: true,
      specs: { engine: '2.0L', power: '194hp', consumption: '5.9L/100km', features: ['Leather', 'Navi', 'Sunroof'] },
    },
  ]);

  console.log(`Created ${vehicles.length} vehicles`);
  return vehicles;
}

async function seedBookings(members, vehicles) {
  console.log('Seeding bookings...');

  const locations = [
    'Αεροδρόμιο Θεσσαλονίκης',
    'Κέντρο Θεσσαλονίκης',
    'Λιμάνι Θεσσαλονίκης',
    'Ξενοδοχείο Makedonia Palace',
    'Σιδηροδρομικός Σταθμός',
  ];

  const extrasOptions = [
    { name: 'GPS Navigation', price: 5 },
    { name: 'Παιδικό Κάθισμα', price: 8 },
    { name: 'Επιπλέον Οδηγός', price: 10 },
    { name: 'Πλήρης Ασφάλεια', price: 20 },
    { name: 'Booster Seat', price: 6 },
  ];

  const insuranceOptions = ['Βασική', 'Πλήρης', 'Super Cover'];
  const allBookings = [];

  const statusSets = [
    // member1 - 10 bookings (5 completed, 2 confirmed, 1 active, 1 pending, 1 canceled)
    [
      { status: 'Completed', daysAgoStart: 120, duration: 5 },
      { status: 'Completed', daysAgoStart: 90, duration: 3 },
      { status: 'Completed', daysAgoStart: 60, duration: 7 },
      { status: 'Completed', daysAgoStart: 45, duration: 4 },
      { status: 'Completed', daysAgoStart: 20, duration: 2 },
      { status: 'Confirmed', daysAgoStart: -10, duration: 5 },
      { status: 'Confirmed', daysAgoStart: -20, duration: 3 },
      { status: 'Active', daysAgoStart: 1, duration: 4 },
      { status: 'Pending', daysAgoStart: -5, duration: 2 },
      { status: 'Canceled', daysAgoStart: 30, duration: 3 },
    ],
    // member2 - 10 bookings (2 completed, 3 confirmed, 1 active, 2 pending, 2 canceled)
    [
      { status: 'Completed', daysAgoStart: 80, duration: 4 },
      { status: 'Completed', daysAgoStart: 40, duration: 2 },
      { status: 'Confirmed', daysAgoStart: -15, duration: 6 },
      { status: 'Confirmed', daysAgoStart: -30, duration: 3 },
      { status: 'Confirmed', daysAgoStart: -45, duration: 5 },
      { status: 'Active', daysAgoStart: 0, duration: 3 },
      { status: 'Pending', daysAgoStart: -7, duration: 2 },
      { status: 'Pending', daysAgoStart: -12, duration: 4 },
      { status: 'Canceled', daysAgoStart: 50, duration: 2 },
      { status: 'Canceled', daysAgoStart: 25, duration: 1 },
    ],
    // member3 - 10 bookings (0 completed, 2 confirmed, 0 active, 5 pending, 3 canceled)
    [
      { status: 'Confirmed', daysAgoStart: -8, duration: 3 },
      { status: 'Confirmed', daysAgoStart: -20, duration: 5 },
      { status: 'Pending', daysAgoStart: -3, duration: 2 },
      { status: 'Pending', daysAgoStart: -10, duration: 4 },
      { status: 'Pending', daysAgoStart: -15, duration: 3 },
      { status: 'Pending', daysAgoStart: -25, duration: 2 },
      { status: 'Pending', daysAgoStart: -40, duration: 6 },
      { status: 'Canceled', daysAgoStart: 10, duration: 2 },
      { status: 'Canceled', daysAgoStart: 20, duration: 3 },
      { status: 'Canceled', daysAgoStart: 35, duration: 1 },
    ],
  ];

  for (let mi = 0; mi < members.length; mi++) {
    const member = members[mi];
    const memberStatuses = statusSets[mi];

    for (let i = 0; i < 10; i++) {
      const { status, daysAgoStart, duration } = memberStatuses[i];
      const vehicle = vehicles[i % vehicles.length];
      const pickup = daysAgoStart > 0 ? daysAgo(daysAgoStart) : daysFromNow(-daysAgoStart);
      const dropoff = new Date(pickup.getTime() + duration * 24 * 3600000);

      const numExtras = randomBetween(0, 2);
      const extras = [];
      for (let e = 0; e < numExtras; e++) {
        extras.push(extrasOptions[randomBetween(0, extrasOptions.length - 1)]);
      }
      const extraTotal = extras.reduce((s, ex) => s + ex.price, 0);
      const basePrice = vehicle.pricePerDay * duration;
      const hasDiscount = Math.random() > 0.7;
      const discountAmount = hasDiscount ? Math.round(basePrice * 0.1) : 0;
      const totalPrice = basePrice + extraTotal - discountAmount;

      const loyaltyPointsEarned = status === 'Completed' ? Math.floor(totalPrice / 10) : 0;

      const booking = await Booking.create({
        memberId: member._id,
        vehicleId: vehicle._id,
        vehicleName: vehicle.name,
        categoryId: vehicle.categoryId,
        status,
        pickupDateTime: pickup,
        dropoffDateTime: dropoff,
        pickupLocation: locations[randomBetween(0, locations.length - 1)],
        dropoffLocation: locations[randomBetween(0, locations.length - 1)],
        extras,
        insurance: insuranceOptions[randomBetween(0, insuranceOptions.length - 1)],
        driverAge: member.driverAge || '23-69',
        totalPrice,
        discountAmount,
        promoCode: hasDiscount ? 'DIAMOND10' : undefined,
        loyaltyPointsEarned,
        cancellationReason: status === 'Canceled' ? 'Αλλαγή σχεδίων' : undefined,
        notes: i % 3 === 0 ? 'Χρειάζομαι το αυτοκίνητο νωρίς το πρωί.' : undefined,
      });

      allBookings.push(booking);
    }
  }

  console.log(`Created ${allBookings.length} bookings`);
  return allBookings;
}

async function seedReviews(members, bookings) {
  console.log('Seeding reviews...');

  const comments = [
    'Εξαιρετική εξυπηρέτηση! Το αυτοκίνητο ήταν καθαρό και σε άριστη κατάσταση.',
    'Πολύ καλή εμπειρία. Θα επαναλάβω σίγουρα!',
    'Γρήγορη παραλαβή, φιλικό προσωπικό. Συστήνω ανεπιφύλακτα.',
    'Το όχημα ήταν ακριβώς όπως περιγραφόταν. Άριστο!',
    'Καλή σχέση ποιότητας-τιμής. Ευχαριστημένος/η.',
  ];

  const reviews = [];
  for (let mi = 0; mi < members.length; mi++) {
    const member = members[mi];
    const memberBookings = bookings.filter(
      b => b.memberId.toString() === member._id.toString() && b.status === 'Completed'
    );

    for (const booking of memberBookings) {
      const vehicleRating = randomBetween(3, 5);
      const serviceRating = randomBetween(4, 5);
      const review = await Review.create({
        bookingId: booking._id,
        userId: member._id,
        vehicleRating,
        serviceRating,
        comment: comments[randomBetween(0, comments.length - 1)],
        isPublished: true,
      });
      reviews.push(review);
    }
  }

  console.log(`Created ${reviews.length} reviews`);
  return reviews;
}

async function seedSupportTickets(members, bookings) {
  console.log('Seeding support tickets...');

  const ticketData = [
    {
      subject: 'Ερώτηση για επέκταση κράτησης',
      category: 'booking',
      body: 'Καλησπέρα, θα ήθελα να ρωτήσω αν είναι δυνατή η παράταση της κράτησής μου για μία επιπλέον ημέρα.',
      status: 'in_progress',
      staffReply: 'Καλησπέρα! Ναι, μπορούμε να παρατείνουμε την κράτησή σας. Παρακαλούμε επικοινωνήστε μαζί μας τηλεφωνικά.',
    },
    {
      subject: 'Παράπονο για τη χρέωση',
      category: 'billing',
      body: 'Παρατηρώ μια επιπλέον χρέωση στον λογαριασμό μου που δεν αναμενόταν. Μπορείτε να το διευκρινίσετε;',
      status: 'resolved',
      staffReply: 'Μετά από έλεγχο, διαπιστώθηκε ότι η χρέωση αφορά την ασφάλεια. Σας στέλνουμε αναλυτικό τιμολόγιο.',
    },
    {
      subject: 'Γενική ερώτηση για τα οχήματα',
      category: 'general',
      body: 'Θα ήθελα να μάθω αν διαθέτετε ηλεκτρικά οχήματα για ενοικίαση.',
      status: 'open',
    },
  ];

  const tickets = [];
  for (let mi = 0; mi < members.length; mi++) {
    const member = members[mi];
    const memberBookings = bookings.filter(b => b.memberId.toString() === member._id.toString());
    const data = ticketData[mi % ticketData.length];

    const messages = [{ sender: 'member', body: data.body }];
    if (data.staffReply) {
      messages.push({ sender: 'staff', body: data.staffReply });
    }

    const ticket = await SupportTicket.create({
      userId: member._id,
      bookingId: memberBookings.length > 0 ? memberBookings[0]._id : undefined,
      subject: data.subject,
      category: data.category,
      status: data.status,
      messages,
    });

    tickets.push(ticket);
  }

  console.log(`Created ${tickets.length} support tickets`);
  return tickets;
}

async function seedNotifications(members, bookings) {
  console.log('Seeding notifications...');

  const notificationTemplates = [
    {
      type: 'booking_confirmed',
      title: 'Επιβεβαίωση Κράτησης',
      body: 'Η κράτησή σας επιβεβαιώθηκε επιτυχώς!',
      isRead: true,
    },
    {
      type: 'loyalty_milestone',
      title: 'Νέο Επίπεδο Loyalty!',
      body: 'Συγχαρητήρια! Αναβαθμιστήκατε σε νέο επίπεδο μέλους!',
      isRead: false,
    },
    {
      type: 'promo',
      title: 'Αποκλειστική Προσφορά',
      body: 'Χρησιμοποιήστε τον κωδικό SUMMER20 για 20% έκπτωση στην επόμενη κράτησή σας!',
      isRead: false,
    },
    {
      type: 'trip_reminder',
      title: 'Υπενθύμιση Ταξιδιού',
      body: 'Η κράτησή σας ξεκινά αύριο! Να έχετε μαζί σας το δίπλωμα και ταυτότητα.',
      isRead: true,
    },
    {
      type: 'review_request',
      title: 'Αξιολογήστε την εμπειρία σας',
      body: 'Πώς ήταν η τελευταία σας ενοικίαση; Αφήστε μια αξιολόγηση και κερδίστε 10 πόντους!',
      isRead: false,
    },
  ];

  const notifications = [];
  for (const member of members) {
    const memberBookings = bookings.filter(b => b.memberId.toString() === member._id.toString());

    for (let i = 0; i < notificationTemplates.length; i++) {
      const tmpl = notificationTemplates[i];
      const relatedBooking = memberBookings[i % memberBookings.length];

      const notif = await Notification.create({
        userId: member._id,
        type: tmpl.type,
        title: tmpl.title,
        body: tmpl.body,
        isRead: tmpl.isRead,
        relatedBookingId: relatedBooking?._id || undefined,
      });
      notifications.push(notif);
    }
  }

  console.log(`Created ${notifications.length} notifications`);
  return notifications;
}

async function seedLoyaltyTransactions(members, bookings) {
  console.log('Seeding loyalty transactions...');

  const transactions = [];
  for (const member of members) {
    const completedBookings = bookings.filter(
      b => b.memberId.toString() === member._id.toString() && b.status === 'Completed'
    );

    for (const booking of completedBookings) {
      const points = Math.floor(booking.totalPrice / 10);
      if (points > 0) {
        const txn = await LoyaltyTransaction.create({
          userId: member._id,
          bookingId: booking._id,
          type: 'earned',
          points,
          description: `Πόντοι από κράτηση #${booking.bookingNumber}`,
        });
        transactions.push(txn);
      }
    }

    // Add a bonus transaction for member1
    if (member.email === 'member1@test.gr') {
      const bonus = await LoyaltyTransaction.create({
        userId: member._id,
        type: 'bonus',
        points: 50,
        description: 'Bonus καλωσορίσματος',
      });
      transactions.push(bonus);
    }
  }

  console.log(`Created ${transactions.length} loyalty transactions`);
  return transactions;
}

async function main() {
  try {
    console.log('\n=== Diamond Rent A Car - Database Seed ===\n');
    console.log(`Connecting to ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    await clearCollections();

    const { admin, member1, member2, member3 } = await seedUsers();
    const vehicles = await seedVehicles();
    const bookings = await seedBookings([member1, member2, member3], vehicles);
    await seedReviews([member1, member2, member3], bookings);
    await seedSupportTickets([member1, member2, member3], bookings);
    await seedNotifications([member1, member2, member3], bookings);
    await seedLoyaltyTransactions([member1, member2, member3], bookings);

    console.log('\n=== Seed Complete ===\n');
    console.log('Test Credentials:');
    console.log('  Admin:   admin@diamondrentacar.gr / Admin123!');
    console.log('  Member1: member1@test.gr / Member123! (Gold tier, 5 completed rentals)');
    console.log('  Member2: member2@test.gr / Member123! (Silver tier, 2 completed rentals)');
    console.log('  Member3: member3@test.gr / Member123! (New tier, unverified email)');
    console.log('\nVehicles seeded: Economy, Compact, SUV, Minivan, Luxury');
    console.log('Bookings per member: 10 (various statuses)');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
