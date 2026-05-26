import PDFDocument from 'pdfkit';
import { formatGreekDate, formatGreekDateTime, formatEUR, STATUS_LABELS } from '../utils/greekText.js';

const BRAND_COLOR = '#1a3c5e';
const ACCENT_COLOR = '#c9a84c';
const GRAY = '#666666';
const LIGHT_GRAY = '#f8f9fa';

function drawHeader(doc, title) {
  // Background header bar
  doc.rect(0, 0, doc.page.width, 110).fill(BRAND_COLOR);

  // Company name
  doc.fillColor('#ffffff')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Diamond Rent A Car', 50, 28);

  // Tagline
  doc.fillColor(ACCENT_COLOR)
    .fontSize(9)
    .font('Helvetica')
    .text('THESSALONIKI, GREECE  |  WWW.DIAMONDRENTACAR.GR', 50, 56);

  // Document title on right
  doc.fillColor('#ffffff')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(title, 50, 75, { align: 'right' });

  doc.moveDown(0);
}

function drawFooter(doc) {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 60;

  doc.rect(0, footerY, doc.page.width, 60).fill(BRAND_COLOR);

  doc.fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica')
    .text('Diamond Rent A Car  |  Thessaloniki, Greece  |  Tel: +30 2310 000 000  |  info@diamondrentacar.gr', 50, footerY + 16, { align: 'center' });

  doc.fillColor(ACCENT_COLOR)
    .fontSize(8)
    .text('www.diamondrentacar.gr', 50, footerY + 34, { align: 'center' });
}

function drawSectionTitle(doc, text, y) {
  doc.rect(50, y, doc.page.width - 100, 22).fill(BRAND_COLOR);
  doc.fillColor('#ffffff')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(text, 58, y + 6);
  return y + 22;
}

function drawRow(doc, label, value, y, isAlt = false) {
  if (isAlt) {
    doc.rect(50, y, doc.page.width - 100, 20).fill(LIGHT_GRAY);
  }
  doc.fillColor(GRAY)
    .fontSize(9)
    .font('Helvetica')
    .text(label, 58, y + 5);
  doc.fillColor(BRAND_COLOR)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(String(value || 'N/A'), 250, y + 5, { width: doc.page.width - 300, align: 'right' });
  return y + 20;
}

export function generateVoucher(booking, member) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawHeader(doc, 'VOUCHER ΚΡΑΤΗΣΗΣ');

    let y = 130;

    // Booking reference box
    doc.rect(50, y, doc.page.width - 100, 50).fill(LIGHT_GRAY).stroke('#eeeeee');
    doc.fillColor(BRAND_COLOR)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Αριθμός Κράτησης:', 60, y + 8);
    doc.fillColor(ACCENT_COLOR)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`#${booking.bookingNumber}`, 60, y + 24);
    // Status badge
    const statusLabel = STATUS_LABELS[booking.status] || booking.status;
    doc.rect(doc.page.width - 160, y + 14, 100, 22).fill(ACCENT_COLOR);
    doc.fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(statusLabel, doc.page.width - 158, y + 20);

    y += 65;

    // Member Info
    y = drawSectionTitle(doc, 'ΣΤΟΙΧΕΙΑ ΜΕΛΟΥΣ', y);
    y = drawRow(doc, 'Ονοματεπώνυμο', `${member.firstName} ${member.lastName}`, y, false);
    y = drawRow(doc, 'Email', member.email, y, true);
    y = drawRow(doc, 'Τηλέφωνο', member.phone || 'N/A', y, false);
    if (member.licenseNumber) {
      y = drawRow(doc, 'Αριθμός Διπλώματος', member.licenseNumber, y, true);
    }

    y += 12;

    // Vehicle Info
    y = drawSectionTitle(doc, 'ΣΤΟΙΧΕΙΑ ΟΧΗΜΑΤΟΣ', y);
    y = drawRow(doc, 'Όχημα', booking.vehicleName, y, false);
    y = drawRow(doc, 'Κατηγορία', booking.categoryId || 'N/A', y, true);
    y = drawRow(doc, 'Ασφάλεια', booking.insurance || 'Βασική', y, false);
    if (booking.driverAge) {
      y = drawRow(doc, 'Ηλικία Οδηγού', booking.driverAge, y, true);
    }

    y += 12;

    // Rental Period
    y = drawSectionTitle(doc, 'ΠΕΡΙΟΔΟΣ ΕΝΟΙΚΙΑΣΗΣ', y);
    y = drawRow(doc, 'Παραλαβή', formatGreekDateTime(booking.pickupDateTime), y, false);
    y = drawRow(doc, 'Τοποθεσία Παραλαβής', booking.pickupLocation || 'N/A', y, true);
    y = drawRow(doc, 'Επιστροφή', formatGreekDateTime(booking.dropoffDateTime), y, false);
    y = drawRow(doc, 'Τοποθεσία Επιστροφής', booking.dropoffLocation || 'N/A', y, true);

    const days = Math.ceil((new Date(booking.dropoffDateTime) - new Date(booking.pickupDateTime)) / 86400000);
    y = drawRow(doc, 'Διάρκεια', `${days} ημέρες`, y, false);

    y += 12;

    // Extras
    if (booking.extras && booking.extras.length > 0) {
      y = drawSectionTitle(doc, 'ΠΡΟΣΘΕΤΕΣ ΥΠΗΡΕΣΙΕΣ', y);
      booking.extras.forEach((extra, idx) => {
        y = drawRow(doc, extra.name, formatEUR(extra.price), y, idx % 2 !== 0);
      });
      y += 12;
    }

    // Pricing
    y = drawSectionTitle(doc, 'ΚΟΣΤΟΛΟΓΗΣΗ', y);
    if (booking.discountAmount > 0) {
      y = drawRow(doc, 'Κωδικός Προσφοράς', booking.promoCode || 'N/A', y, false);
      y = drawRow(doc, 'Έκπτωση', `- ${formatEUR(booking.discountAmount)}`, y, true);
    }

    // Total price highlight
    doc.rect(50, y, doc.page.width - 100, 28).fill(BRAND_COLOR);
    doc.fillColor('#ffffff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ', 58, y + 8);
    doc.fillColor(ACCENT_COLOR)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(formatEUR(booking.totalPrice), 58, y + 8, { align: 'right', width: doc.page.width - 116 });
    y += 40;

    // Notes
    if (booking.notes) {
      y += 8;
      y = drawSectionTitle(doc, 'ΣΗΜΕΙΩΣΕΙΣ', y);
      doc.rect(50, y, doc.page.width - 100, 40).fill(LIGHT_GRAY);
      doc.fillColor(GRAY)
        .fontSize(9)
        .font('Helvetica')
        .text(booking.notes, 58, y + 8, { width: doc.page.width - 116 });
      y += 48;
    }

    // Terms note
    y += 8;
    doc.rect(50, y, doc.page.width - 100, 36).fill('#fff8e1').stroke('#f0c040');
    doc.fillColor('#7a6000')
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Αυτό το voucher πρέπει να προσκομιστεί κατά την παραλαβή του οχήματος. Απαιτείται ισχύον δίπλωμα οδήγησης και πιστωτική κάρτα για εγγύηση.',
        58, y + 10, { width: doc.page.width - 116 }
      );

    drawFooter(doc);
    doc.end();
  });
}

export function generateInvoice(booking, member) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawHeader(doc, 'ΤΙΜΟΛΟΓΙΟ / INVOICE');

    let y = 130;

    // Invoice meta
    const invoiceNumber = `INV-${booking.bookingNumber}`;
    const invoiceDate = formatGreekDate(booking.updatedAt || new Date());

    doc.rect(50, y, doc.page.width - 100, 50).fill(LIGHT_GRAY).stroke('#eeeeee');
    doc.fillColor(BRAND_COLOR)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Αριθμός Τιμολογίου:', 60, y + 8);
    doc.fillColor(ACCENT_COLOR)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(invoiceNumber, 60, y + 22);

    doc.fillColor(GRAY)
      .fontSize(9)
      .font('Helvetica')
      .text(`Ημερομηνία: ${invoiceDate}`, doc.page.width - 230, y + 8);
    doc.fillColor(GRAY)
      .text(`Κράτηση: #${booking.bookingNumber}`, doc.page.width - 230, y + 22);

    y += 65;

    // Billing info
    y = drawSectionTitle(doc, 'ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ', y);
    y = drawRow(doc, 'Ονοματεπώνυμο', `${member.firstName} ${member.lastName}`, y, false);
    y = drawRow(doc, 'Email', member.email, y, true);
    y = drawRow(doc, 'Τηλέφωνο', member.phone || 'N/A', y, false);

    y += 12;

    // Company info
    y = drawSectionTitle(doc, 'ΣΤΟΙΧΕΙΑ ΕΤΑΙΡΕΙΑΣ', y);
    y = drawRow(doc, 'Επωνυμία', 'Diamond Rent A Car', y, false);
    y = drawRow(doc, 'Διεύθυνση', 'Thessaloniki, Greece', y, true);
    y = drawRow(doc, 'ΑΦΜ', 'EL000000000', y, false);
    y = drawRow(doc, 'Τηλέφωνο', '+30 2310 000 000', y, true);

    y += 12;

    // Service itemization
    y = drawSectionTitle(doc, 'ΑΝΑΛΥΣΗ ΧΡΕΩΣΕΩΝ', y);

    // Header row
    doc.rect(50, y, doc.page.width - 100, 20).fill('#e8ecf0');
    doc.fillColor(BRAND_COLOR)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Περιγραφή', 58, y + 5);
    doc.text('Τεμ.', 340, y + 5);
    doc.text('Τιμή', 390, y + 5);
    doc.text('Σύνολο', 450, y + 5, { align: 'right', width: doc.page.width - 500 });
    y += 20;

    const days = Math.max(1, Math.ceil((new Date(booking.dropoffDateTime) - new Date(booking.pickupDateTime)) / 86400000));
    const pricePerDay = booking.totalPrice / days;
    let subtotal = 0;

    // Base rental row
    const baseAmount = pricePerDay * days;
    subtotal += baseAmount;
    doc.rect(50, y, doc.page.width - 100, 20).fill(LIGHT_GRAY);
    doc.fillColor('#333')
      .fontSize(9)
      .font('Helvetica')
      .text(`Ενοικίαση ${booking.vehicleName || 'οχήματος'}`, 58, y + 5);
    doc.text(String(days), 340, y + 5);
    doc.text(formatEUR(pricePerDay), 390, y + 5);
    doc.fillColor(BRAND_COLOR)
      .font('Helvetica-Bold')
      .text(formatEUR(baseAmount), 450, y + 5, { align: 'right', width: doc.page.width - 500 });
    y += 20;

    // Extras rows
    if (booking.extras && booking.extras.length > 0) {
      booking.extras.forEach((extra, idx) => {
        subtotal += extra.price;
        if (idx % 2 === 0) {
          doc.rect(50, y, doc.page.width - 100, 20).fill('#ffffff');
        } else {
          doc.rect(50, y, doc.page.width - 100, 20).fill(LIGHT_GRAY);
        }
        doc.fillColor('#333')
          .fontSize(9)
          .font('Helvetica')
          .text(extra.name, 58, y + 5);
        doc.text('1', 340, y + 5);
        doc.text(formatEUR(extra.price), 390, y + 5);
        doc.fillColor(BRAND_COLOR)
          .font('Helvetica-Bold')
          .text(formatEUR(extra.price), 450, y + 5, { align: 'right', width: doc.page.width - 500 });
        y += 20;
      });
    }

    y += 8;

    // Subtotals section
    const vatRate = 0.24;
    const discountAmount = booking.discountAmount || 0;
    const preTaxTotal = subtotal - discountAmount;
    const vatBase = preTaxTotal / (1 + vatRate);
    const vatAmount = preTaxTotal - vatBase;

    // Discount row
    if (discountAmount > 0) {
      doc.rect(50, y, doc.page.width - 100, 20).fill('#e8f5e9');
      doc.fillColor('#27ae60')
        .fontSize(9)
        .font('Helvetica')
        .text(`Έκπτωση (${booking.promoCode || 'Promo'})`, 58, y + 5);
      doc.font('Helvetica-Bold')
        .text(`- ${formatEUR(discountAmount)}`, 58, y + 5, { align: 'right', width: doc.page.width - 116 });
      y += 20;
    }

    // Net amount
    doc.rect(50, y, doc.page.width - 100, 20).fill(LIGHT_GRAY);
    doc.fillColor(GRAY)
      .fontSize(9)
      .font('Helvetica')
      .text('Καθαρό Ποσό (χωρίς ΦΠΑ)', 58, y + 5);
    doc.fillColor(BRAND_COLOR)
      .font('Helvetica-Bold')
      .text(formatEUR(vatBase), 58, y + 5, { align: 'right', width: doc.page.width - 116 });
    y += 20;

    // VAT
    doc.rect(50, y, doc.page.width - 100, 20).fill('#ffffff');
    doc.fillColor(GRAY)
      .fontSize(9)
      .font('Helvetica')
      .text(`ΦΠΑ (${Math.round(vatRate * 100)}%)`, 58, y + 5);
    doc.fillColor(BRAND_COLOR)
      .font('Helvetica-Bold')
      .text(formatEUR(vatAmount), 58, y + 5, { align: 'right', width: doc.page.width - 116 });
    y += 20;

    // Grand total
    doc.rect(50, y, doc.page.width - 100, 30).fill(BRAND_COLOR);
    doc.fillColor('#ffffff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('ΣΥΝΟΛΟ ΠΛΗΡΩΜΗΣ', 58, y + 9);
    doc.fillColor(ACCENT_COLOR)
      .fontSize(13)
      .text(formatEUR(booking.totalPrice), 58, y + 9, { align: 'right', width: doc.page.width - 116 });
    y += 42;

    // Payment info
    y += 4;
    y = drawSectionTitle(doc, 'ΠΛΗΡΟΦΟΡΙΕΣ ΠΛΗΡΩΜΗΣ', y);
    y = drawRow(doc, 'Μέθοδος Πληρωμής', 'Πιστωτική Κάρτα', y, false);
    y = drawRow(doc, 'Κατάσταση', 'Πληρωμένο', y, true);
    y = drawRow(doc, 'Ημερομηνία Πληρωμής', invoiceDate, y, false);

    // Legal note
    y += 12;
    doc.rect(50, y, doc.page.width - 100, 44).fill('#fff8e1').stroke('#f0c040');
    doc.fillColor('#7a6000')
      .fontSize(7.5)
      .font('Helvetica')
      .text(
        'Αυτό το τιμολόγιο εκδόθηκε αυτόματα από το σύστημα Diamond Rent A Car. ' +
        'Ο ΦΠΑ υπολογίζεται με βάση τον ισχύοντα συντελεστή 24%. ' +
        'Για οποιαδήποτε διόρθωση ή ερώτηση, επικοινωνήστε με τη λογιστική μας υπηρεσία στο billing@diamondrentacar.gr.',
        58, y + 8, { width: doc.page.width - 116 }
      );

    drawFooter(doc);
    doc.end();
  });
}
