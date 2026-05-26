import { transporter } from '../config/email.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { formatGreekDate, formatGreekDateTime, formatEUR } from '../utils/greekText.js';

const primaryColor = '#1a3c5e';
const accentColor = '#c9a84c';
const lightBg = '#f8f9fa';

const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #333333; }
  .wrapper { width: 100%; background-color: #f4f6f8; padding: 30px 0; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background-color: ${primaryColor}; padding: 32px 40px; text-align: center; }
  .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
  .header p { margin: 6px 0 0; color: ${accentColor}; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; }
  .content { padding: 36px 40px; }
  .greeting { font-size: 18px; font-weight: 600; color: ${primaryColor}; margin-bottom: 16px; }
  .body-text { font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 20px; }
  .cta-btn { display: inline-block; background-color: ${accentColor}; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 700; margin: 16px 0; letter-spacing: 0.5px; }
  .info-box { background-color: ${lightBg}; border-left: 4px solid ${accentColor}; border-radius: 4px; padding: 20px 24px; margin: 24px 0; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
  .info-label { color: #888888; font-weight: 500; }
  .info-value { color: ${primaryColor}; font-weight: 600; text-align: right; }
  .divider { border: none; border-top: 1px solid #eeeeee; margin: 28px 0; }
  .footer { background-color: ${primaryColor}; padding: 24px 40px; text-align: center; }
  .footer p { margin: 4px 0; color: rgba(255,255,255,0.7); font-size: 12px; }
  .footer a { color: ${accentColor}; text-decoration: none; }
  .badge { display: inline-block; background-color: ${accentColor}; color: #fff; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; }
  .tier-box { text-align: center; background: linear-gradient(135deg, ${primaryColor}, #2d6a9f); border-radius: 8px; padding: 28px; margin: 24px 0; color: #ffffff; }
  .tier-box h2 { margin: 0 0 8px; font-size: 28px; color: ${accentColor}; }
  .tier-box p { margin: 0; color: rgba(255,255,255,0.85); font-size: 15px; }
  table.detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  table.detail-table td { padding: 10px 0; border-bottom: 1px solid #eeeeee; font-size: 14px; }
  table.detail-table td:first-child { color: #888888; width: 45%; }
  table.detail-table td:last-child { color: ${primaryColor}; font-weight: 600; text-align: right; }
  @media only screen and (max-width: 600px) {
    .content { padding: 24px 20px; }
    .header { padding: 24px 20px; }
    .footer { padding: 20px; }
  }
`;

function wrapEmail(content, title) {
  return `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Diamond Rent A Car</h1>
        <p>Members Portal</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Diamond Rent A Car &mdash; Thessaloniki, Greece</p>
        <p><a href="https://www.diamondrentacar.gr">www.diamondrentacar.gr</a> | <a href="tel:+302310000000">+30 2310 000 000</a></p>
        <p style="margin-top:12px; font-size:11px;">Αυτό το email στάλθηκε αυτόματα. Παρακαλούμε μην απαντάτε σε αυτό.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject });
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
  }
}

export async function sendWelcomeEmail(user, verifyLink) {
  const content = `
    <p class="greeting">Καλωσορίσατε, ${user.firstName}!</p>
    <p class="body-text">
      Χαιρόμαστε πολύ που γίνεστε μέλος του Diamond Rent A Car Members Portal!
      Απολαύστε αποκλειστικά οφέλη, παρακολουθήστε τις κρατήσεις σας και κερδίστε πόντους loyalty με κάθε ενοικίαση.
    </p>
    <div class="info-box">
      <p style="margin:0 0 12px; font-weight:600; color:${primaryColor}; font-size:15px;">Τα οφέλη σας ως μέλος:</p>
      <p style="margin:6px 0; font-size:14px; color:#555;">&#10003; &nbsp;Αποκλειστικές τιμές για μέλη</p>
      <p style="margin:6px 0; font-size:14px; color:#555;">&#10003; &nbsp;Πρόγραμμα Loyalty Points</p>
      <p style="margin:6px 0; font-size:14px; color:#555;">&#10003; &nbsp;Γρήγορη διαδικασία παραλαβής</p>
      <p style="margin:6px 0; font-size:14px; color:#555;">&#10003; &nbsp;24/7 Υποστήριξη</p>
    </div>
    <p class="body-text">Για να ενεργοποιήσετε τον λογαριασμό σας, επιβεβαιώστε τη διεύθυνση email σας:</p>
    <div style="text-align:center; margin:28px 0;">
      <a href="${verifyLink}" class="cta-btn">Επιβεβαίωση Email</a>
    </div>
    <p class="body-text" style="font-size:13px; color:#888;">
      Ο σύνδεσμος λήγει σε 24 ώρες. Αν δεν δημιουργήσατε εσείς αυτόν τον λογαριασμό, αγνοήστε αυτό το email.
    </p>
  `;
  await sendMail(user.email, 'Καλωσορίσατε στο Diamond Rent A Car Members Portal!', wrapEmail(content, 'Καλωσορίσατε'));
}

export async function sendVerificationEmail(user, verifyLink) {
  const content = `
    <p class="greeting">Επιβεβαίωση Email</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, παρακαλούμε επιβεβαιώστε τη διεύθυνση email σας για να έχετε πλήρη πρόσβαση στον λογαριασμό σας.
    </p>
    <div style="text-align:center; margin:32px 0;">
      <a href="${verifyLink}" class="cta-btn">Επιβεβαίωση Email</a>
    </div>
    <p class="body-text" style="font-size:13px; color:#888;">
      Ο σύνδεσμος λήγει σε 24 ώρες.<br/>
      Αν δυσκολεύεστε να κάνετε κλικ στο κουμπί, αντιγράψτε τον παρακάτω σύνδεσμο στο πρόγραμμα περιήγησής σας:<br/>
      <span style="word-break:break-all; color:${primaryColor};">${verifyLink}</span>
    </p>
  `;
  await sendMail(user.email, 'Επιβεβαιώστε τη διεύθυνση email σας', wrapEmail(content, 'Επιβεβαίωση Email'));
}

export async function sendPasswordResetEmail(user, resetLink) {
  const content = `
    <p class="greeting">Επαναφορά Κωδικού</p>
    <p class="body-text">
      Λάβαμε αίτημα επαναφοράς κωδικού πρόσβασης για τον λογαριασμό σας (${user.email}).
    </p>
    <div style="text-align:center; margin:32px 0;">
      <a href="${resetLink}" class="cta-btn">Επαναφορά Κωδικού</a>
    </div>
    <div class="info-box" style="border-left-color:#e74c3c;">
      <p style="margin:0; font-size:14px; color:#555;">
        <strong>Σημαντικό:</strong> Αυτός ο σύνδεσμος λήγει σε <strong>1 ώρα</strong>.
        Αν δεν ζητήσατε εσείς την επαναφορά κωδικού, αγνοήστε αυτό το email &mdash; ο λογαριασμός σας παραμένει ασφαλής.
      </p>
    </div>
    <p class="body-text" style="font-size:13px; color:#888; word-break:break-all;">
      ${resetLink}
    </p>
  `;
  await sendMail(user.email, 'Επαναφορά Κωδικού - Diamond Rent A Car', wrapEmail(content, 'Επαναφορά Κωδικού'));
}

export async function sendBookingConfirmation(user, booking) {
  const pickupStr = formatGreekDateTime(booking.pickupDateTime);
  const dropoffStr = formatGreekDateTime(booking.dropoffDateTime);
  const totalStr = formatEUR(booking.totalPrice);

  const extrasHtml = booking.extras && booking.extras.length > 0
    ? booking.extras.map(e => `<tr><td>+ ${e.name}</td><td>${formatEUR(e.price)}</td></tr>`).join('')
    : '<tr><td colspan="2" style="color:#888;">Χωρίς πρόσθετες υπηρεσίες</td></tr>';

  const content = `
    <p class="greeting">Η κράτησή σας επιβεβαιώθηκε!</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, η κράτησή σας επιβεβαιώθηκε με επιτυχία. Παρακάτω θα βρείτε τις λεπτομέρειες της ενοικίασής σας.
    </p>
    <div class="info-box">
      <p style="margin:0 0 16px; font-weight:700; color:${primaryColor}; font-size:16px;">
        Κράτηση #${booking.bookingNumber}
        <span class="badge" style="float:right;">Επιβεβαιωμένη</span>
      </p>
      <table class="detail-table">
        <tr><td>Όχημα</td><td>${booking.vehicleName || 'N/A'}</td></tr>
        <tr><td>Παραλαβή</td><td>${pickupStr}</td></tr>
        <tr><td>Τοποθεσία παραλαβής</td><td>${booking.pickupLocation || 'N/A'}</td></tr>
        <tr><td>Επιστροφή</td><td>${dropoffStr}</td></tr>
        <tr><td>Τοποθεσία επιστροφής</td><td>${booking.dropoffLocation || 'N/A'}</td></tr>
        <tr><td>Ασφάλεια</td><td>${booking.insurance || 'Βασική'}</td></tr>
        ${extrasHtml}
        ${booking.discountAmount > 0 ? `<tr><td>Έκπτωση (${booking.promoCode})</td><td style="color:#27ae60;">- ${formatEUR(booking.discountAmount)}</td></tr>` : ''}
        <tr><td><strong>Συνολικό Κόστος</strong></td><td><strong style="color:${accentColor}; font-size:16px;">${totalStr}</strong></td></tr>
      </table>
    </div>
    ${booking.loyaltyPointsEarned > 0 ? `
    <div style="text-align:center; background:${lightBg}; border-radius:6px; padding:16px; margin:16px 0;">
      <p style="margin:0; font-size:14px; color:#555;">Κερδίσατε <strong style="color:${accentColor};">${booking.loyaltyPointsEarned} πόντους loyalty</strong> με αυτή την κράτηση!</p>
    </div>` : ''}
    <p class="body-text" style="font-size:13px; color:#888;">
      Αν χρειαστείτε οποιαδήποτε βοήθεια, επικοινωνήστε μαζί μας ή χρησιμοποιήστε τη φόρμα υποστήριξης στο portal.
    </p>
  `;
  await sendMail(user.email, `Επιβεβαίωση Κράτησης #${booking.bookingNumber}`, wrapEmail(content, 'Επιβεβαίωση Κράτησης'));
}

export async function sendBookingChanged(user, booking, changes) {
  const changesHtml = changes && Object.keys(changes).length > 0
    ? Object.entries(changes).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')
    : '<tr><td colspan="2">Ενημερώθηκαν τα στοιχεία της κράτησης</td></tr>';

  const content = `
    <p class="greeting">Η κράτησή σας ενημερώθηκε</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, η κράτηση #${booking.bookingNumber} έχει τροποποιηθεί. Παρακάτω θα βρείτε τις αλλαγές:
    </p>
    <div class="info-box">
      <p style="margin:0 0 16px; font-weight:700; color:${primaryColor}; font-size:15px;">Αλλαγές στην κράτηση</p>
      <table class="detail-table">
        ${changesHtml}
      </table>
    </div>
    <div style="margin:20px 0;">
      <p style="font-size:14px; color:#555; margin:0 0 8px;"><strong>Τρέχουσες λεπτομέρειες:</strong></p>
      <table class="detail-table">
        <tr><td>Αριθμός Κράτησης</td><td>#${booking.bookingNumber}</td></tr>
        <tr><td>Όχημα</td><td>${booking.vehicleName || 'N/A'}</td></tr>
        <tr><td>Παραλαβή</td><td>${formatGreekDateTime(booking.pickupDateTime)}</td></tr>
        <tr><td>Επιστροφή</td><td>${formatGreekDateTime(booking.dropoffDateTime)}</td></tr>
        <tr><td>Σύνολο</td><td>${formatEUR(booking.totalPrice)}</td></tr>
      </table>
    </div>
    <p class="body-text" style="font-size:13px; color:#888;">
      Αν δεν ζητήσατε εσείς αυτή την αλλαγή ή έχετε ερωτήσεις, επικοινωνήστε μαζί μας αμέσως.
    </p>
  `;
  await sendMail(user.email, `Αλλαγή Κράτησης #${booking.bookingNumber}`, wrapEmail(content, 'Αλλαγή Κράτησης'));
}

export async function sendBookingCanceled(user, booking) {
  const content = `
    <p class="greeting">Η κράτησή σας ακυρώθηκε</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, η κράτηση #${booking.bookingNumber} έχει ακυρωθεί.
    </p>
    <div class="info-box" style="border-left-color:#e74c3c;">
      <table class="detail-table">
        <tr><td>Αριθμός Κράτησης</td><td>#${booking.bookingNumber}</td></tr>
        <tr><td>Όχημα</td><td>${booking.vehicleName || 'N/A'}</td></tr>
        <tr><td>Ημερομηνία Παραλαβής</td><td>${formatGreekDate(booking.pickupDateTime)}</td></tr>
        <tr><td>Συνολικό Κόστος</td><td>${formatEUR(booking.totalPrice)}</td></tr>
        ${booking.cancellationReason ? `<tr><td>Λόγος Ακύρωσης</td><td>${booking.cancellationReason}</td></tr>` : ''}
      </table>
    </div>
    <p class="body-text">
      Η επιστροφή χρημάτων (αν ισχύει) θα επεξεργαστεί εντός 5-10 εργάσιμων ημερών στην αρχική μέθοδο πληρωμής.
    </p>
    <p class="body-text" style="font-size:13px; color:#888;">
      Αν ακυρώσατε εκ παραδρομής ή χρειάζεστε βοήθεια, επικοινωνήστε μαζί μας.
    </p>
  `;
  await sendMail(user.email, `Ακύρωση Κράτησης #${booking.bookingNumber}`, wrapEmail(content, 'Ακύρωση Κράτησης'));
}

export async function sendTripReminder(user, booking) {
  const content = `
    <p class="greeting">Το ταξίδι σας ξεκινά αύριο!</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, σας υπενθυμίζουμε ότι η ενοικίαση του οχήματός σας ξεκινά αύριο. Είστε έτοιμοι;
    </p>
    <div class="info-box">
      <p style="margin:0 0 16px; font-weight:700; color:${primaryColor}; font-size:15px;">Στοιχεία Ενοικίασης</p>
      <table class="detail-table">
        <tr><td>Αριθμός Κράτησης</td><td>#${booking.bookingNumber}</td></tr>
        <tr><td>Όχημα</td><td>${booking.vehicleName || 'N/A'}</td></tr>
        <tr><td>Παραλαβή</td><td>${formatGreekDateTime(booking.pickupDateTime)}</td></tr>
        <tr><td>Τοποθεσία Παραλαβής</td><td>${booking.pickupLocation || 'N/A'}</td></tr>
        <tr><td>Επιστροφή</td><td>${formatGreekDateTime(booking.dropoffDateTime)}</td></tr>
      </table>
    </div>
    <div class="info-box" style="background:#e8f5e9; border-left-color:#27ae60;">
      <p style="margin:0 0 8px; font-weight:600; color:#1a5e2a; font-size:14px;">Τι να φέρετε μαζί σας:</p>
      <p style="margin:4px 0; font-size:13px; color:#2d6a35;">&#10003; &nbsp;Δίπλωμα οδήγησης</p>
      <p style="margin:4px 0; font-size:13px; color:#2d6a35;">&#10003; &nbsp;Ταυτότητα ή διαβατήριο</p>
      <p style="margin:4px 0; font-size:13px; color:#2d6a35;">&#10003; &nbsp;Πιστωτική κάρτα για εγγύηση</p>
      <p style="margin:4px 0; font-size:13px; color:#2d6a35;">&#10003; &nbsp;Επιβεβαίωση κράτησης (αυτό το email)</p>
    </div>
    <p class="body-text" style="font-size:13px; color:#888;">
      Για οποιαδήποτε απορία, επικοινωνήστε μαζί μας στο +30 2310 000 000.
    </p>
  `;
  await sendMail(user.email, `Υπενθύμιση: Η ενοικίασή σας ξεκινά αύριο - #${booking.bookingNumber}`, wrapEmail(content, 'Υπενθύμιση Ταξιδιού'));
}

export async function sendReviewRequest(user, booking) {
  const content = `
    <p class="greeting">Πώς ήταν η εμπειρία σας;</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, ελπίζουμε να απολαύσατε την ενοικίαση #${booking.bookingNumber} για το ${booking.vehicleName}.
      Η γνώμη σας είναι πολύτιμη για εμάς!
    </p>
    <div style="text-align:center; margin:28px 0;">
      <p style="font-size:32px; margin:0 0 8px;">&#11088; &#11088; &#11088; &#11088; &#11088;</p>
      <p style="font-size:14px; color:#888; margin:0 0 20px;">Αξιολογήστε από 1 έως 5 αστέρια</p>
      <a href="${env.CLIENT_URL}/bookings/${booking._id}/review" class="cta-btn">Αφήστε Αξιολόγηση</a>
    </div>
    <div class="info-box">
      <table class="detail-table">
        <tr><td>Κράτηση</td><td>#${booking.bookingNumber}</td></tr>
        <tr><td>Όχημα</td><td>${booking.vehicleName || 'N/A'}</td></tr>
        <tr><td>Ημερομηνία Επιστροφής</td><td>${formatGreekDate(booking.dropoffDateTime)}</td></tr>
      </table>
    </div>
    <p class="body-text" style="font-size:13px; color:#888;">
      Η αξιολόγηση διαρκεί μόνο 1 λεπτό και μας βοηθά να βελτιωνόμαστε συνεχώς.
      Επίσης, κερδίζετε <strong>10 πόντους loyalty</strong> για κάθε αξιολόγηση!
    </p>
  `;
  await sendMail(user.email, `Αξιολογήστε την ενοικίαση #${booking.bookingNumber}`, wrapEmail(content, 'Αίτημα Αξιολόγησης'));
}

export async function sendLoyaltyMilestone(user, newTier) {
  const tierNames = { silver: 'Αργυρό', gold: 'Χρυσό', platinum: 'Platinum' };
  const tierBenefits = {
    silver: ['5% έκπτωση σε όλες τις κρατήσεις', 'Προτεραιότητα εξυπηρέτησης', 'Δωρεάν αναβάθμιση (εφόσον διατίθεται)'],
    gold: ['10% έκπτωση σε όλες τις κρατήσεις', 'Δωρεάν GPS σε κάθε κράτηση', 'Express check-in', 'Αφιερωμένος αντιπρόσωπος'],
    platinum: ['15% έκπτωση σε όλες τις κρατήσεις', 'Δωρεάν αναβάθμιση κατηγορίας', 'VIP παραλαβή & παράδοση', 'Απεριόριστα extras', 'Personal concierge'],
  };
  const benefits = tierBenefits[newTier] || [];
  const tierName = tierNames[newTier] || newTier;

  const content = `
    <div class="tier-box">
      <p style="margin:0 0 8px; font-size:40px;">&#127942;</p>
      <h2>${tierName} Μέλος</h2>
      <p>Συγχαρητήρια ${user.firstName}! Αναβαθμιστήκατε!</p>
    </div>
    <p class="body-text">
      Είμαστε στην ευχάριστη θέση να σας ανακοινώσουμε ότι αναβαθμιστήκατε στο επίπεδο
      <strong>${tierName} Μέλος</strong> του προγράμματος Diamond Loyalty!
    </p>
    <div class="info-box">
      <p style="margin:0 0 12px; font-weight:700; color:${primaryColor}; font-size:15px;">Τα νέα σας οφέλη:</p>
      ${benefits.map(b => `<p style="margin:6px 0; font-size:14px; color:#555;">&#10003; &nbsp;${b}</p>`).join('')}
    </div>
    <p class="body-text">
      Συνεχίστε να ενοικιάζετε με Diamond Rent A Car και ανακαλύψτε ακόμα περισσότερα προνόμια!
    </p>
    <p class="body-text" style="font-size:13px; color:#888;">
      Τα οφέλη σας ενεργοποιούνται αυτόματα στην επόμενη κράτησή σας.
    </p>
  `;
  await sendMail(user.email, `Συγχαρητήρια! Αναβαθμιστήκατε σε ${tierName} Μέλος!`, wrapEmail(content, 'Loyalty Milestone'));
}

export async function sendSupportReply(user, ticket) {
  const lastMessage = ticket.messages && ticket.messages.length > 0
    ? ticket.messages[ticket.messages.length - 1]
    : null;

  const content = `
    <p class="greeting">Νέα απάντηση στο ticket σας</p>
    <p class="body-text">
      Γεια σας ${user.firstName}, η ομάδα υποστήριξης απάντησε στο αίτημά σας.
    </p>
    <div class="info-box">
      <p style="margin:0 0 12px; font-weight:700; color:${primaryColor}; font-size:15px;">${ticket.subject}</p>
      <p style="margin:0 0 8px; font-size:13px; color:#888;">Κατάσταση: <span class="badge">${ticket.status === 'in_progress' ? 'Σε εξέλιξη' : ticket.status === 'resolved' ? 'Επιλύθηκε' : 'Ανοιχτό'}</span></p>
      ${lastMessage ? `
      <hr style="border:none; border-top:1px solid #eee; margin:16px 0;" />
      <p style="margin:0 0 8px; font-size:13px; color:#888; font-weight:600;">Τελευταία απάντηση:</p>
      <p style="margin:0; font-size:14px; color:#333; background:#fff; padding:12px; border-radius:4px; border:1px solid #eee;">${lastMessage.body}</p>
      ` : ''}
    </div>
    <div style="text-align:center; margin:24px 0;">
      <a href="${env.CLIENT_URL}/support/tickets/${ticket._id}" class="cta-btn">Δείτε την Απάντηση</a>
    </div>
    <p class="body-text" style="font-size:13px; color:#888;">
      Μπορείτε να απαντήσετε άμεσα μέσω του portal μας.
    </p>
  `;
  await sendMail(user.email, `Απάντηση στο Ticket: ${ticket.subject}`, wrapEmail(content, 'Απάντηση Υποστήριξης'));
}
