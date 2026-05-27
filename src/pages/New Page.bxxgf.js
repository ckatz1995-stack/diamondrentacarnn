// SETUP IN WIX STUDIO:
// 1. Page URL → /member-portal
// 2. Add HTML iframe element, source: member-portal/portal.html
// 4. iframe element ID can be anything — code auto-detects it

import wixLocation from 'wix-location';
import { authentication, currentMember } from 'wix-members-frontend';
import { getMyBookings, getMyProfile, cancelMyBooking, updateMyBooking, updateMyProfile, checkBookingAvailability, submitBookingReview, getExtendedProfile, updateExtendedProfile, getMyNotifications, markNotificationRead, readAllMyNotifications, deleteMyNotification, getMyTickets, createMyTicket, replyToMyTicket } from 'backend/memberPortal.jsw';
import { PORTAL_LOCATIONS } from 'public/siteConstants';
import { isTrustedBridgeOrigin, normalizeBridgeMessage, postMessageSafe, resolveHtmlComponent } from 'public/bridgeUtils';

const COMP_IDS = ['#mbrPortalHtml', '#html1', '#html2', '#html3', '#htmlComponent1', '#htmlComp1', '#htmlComp', '#iframeComp', '#bpage1', '#bpage2'];

function getComp() { return resolveHtmlComponent($w, COMP_IDS); }
function post(payload) { return postMessageSafe(getComp(), payload, 'MemberPortal'); }

function getInitialTab() {
  try { return (wixLocation.query && wixLocation.query.tab) || 'bookings'; }
  catch (_) { return 'bookings'; }
}

async function getMemberInfo() {
  try {
    const m = await currentMember.getMember({ fieldsets: ['FULL'] });
    if (!m) return null;
    const d = m.contactDetails || {};
    return {
      name: ((d.firstName || '') + ' ' + (d.lastName || '')).trim(),
      email: (d.emails && d.emails[0]) || m.loginEmail || '',
      memberId: m._id || ''
    };
  } catch (_) { return null; }
}

function sendInit(info) {
  post({ type: 'MEMBER_INIT', member: info, tab: getInitialTab(), locations: PORTAL_LOCATIONS || [] });
}

function handleMessage(event) {
  const origin = String(event?.origin || '').trim();
  if (origin && !isTrustedBridgeOrigin(origin, wixLocation.url)) return;
  const msg = normalizeBridgeMessage(event && event.data);
  if (!msg || !msg.type) return;

  if (msg.type === 'PORTAL_READY' || msg.type === 'bridge-ready') {
    getMemberInfo().then((info) => { if (info) sendInit(info); });
    return;
  }

  if (msg.type === 'REQUEST_MY_BOOKINGS') {
    getMyBookings(msg.filter || null)
      .then((r) => post({ type: 'MY_BOOKINGS', ...r }))
      .catch(() => post({ type: 'MY_BOOKINGS', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'REQUEST_MY_PROFILE') {
    getMyProfile()
      .then((r) => post({ type: 'MY_PROFILE', ...r }))
      .catch(() => post({ type: 'MY_PROFILE', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'CANCEL_BOOKING') {
    cancelMyBooking({ bookingId: msg.bookingId, reason: msg.reason || '' })
      .then((r) => post({ type: 'CANCEL_RESULT', bookingId: msg.bookingId, ...r }))
      .catch(() => post({ type: 'CANCEL_RESULT', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'UPDATE_BOOKING') {
    updateMyBooking({ bookingId: msg.bookingId, changes: msg.changes || {} })
      .then((r) => post({ type: 'UPDATE_BOOKING_RESULT', bookingId: msg.bookingId, ...r }))
      .catch(() => post({ type: 'UPDATE_BOOKING_RESULT', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'UPDATE_PROFILE') {
    updateMyProfile({ firstName: msg.firstName, lastName: msg.lastName, phone: msg.phone })
      .then((r) => post({ type: 'UPDATE_PROFILE_RESULT', ...r }))
      .catch(() => post({ type: 'UPDATE_PROFILE_RESULT', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'MEMBER_PORTAL_NAV') {
    if (msg.path) { try { wixLocation.to(String(msg.path)); } catch (_) {} }
    return;
  }

  if (msg.type === 'CHECK_AVAILABILITY') {
    checkBookingAvailability({ categoryId: msg.categoryId, pickupDateTime: msg.pickupDateTime, dropoffDateTime: msg.dropoffDateTime, excludeBookingId: msg.bookingId })
      .then((r) => post({ type: 'AVAILABILITY_RESULT', ...r }))
      .catch(() => post({ type: 'AVAILABILITY_RESULT', ok: true, available: true, conflicts: 0 }));
    return;
  }

  if (msg.type === 'SUBMIT_REVIEW') {
    submitBookingReview({ bookingId: msg.bookingId, rating: msg.rating, comment: msg.comment || '' })
      .then((r) => post({ type: 'REVIEW_RESULT', bookingId: msg.bookingId, ...r }))
      .catch(() => post({ type: 'REVIEW_RESULT', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'GET_EXTENDED_PROFILE') {
    getExtendedProfile()
      .then((r) => post({ type: 'EXTENDED_PROFILE', ...r }))
      .catch(() => post({ type: 'EXTENDED_PROFILE', ok: false }));
    return;
  }

  if (msg.type === 'UPDATE_EXTENDED_PROFILE') {
    updateExtendedProfile({ driverAge: msg.driverAge, nationality: msg.nationality, licenseNumber: msg.licenseNumber, licenseExpiry: msg.licenseExpiry })
      .then((r) => post({ type: 'UPDATE_EXTENDED_PROFILE_RESULT', ...r }))
      .catch(() => post({ type: 'UPDATE_EXTENDED_PROFILE_RESULT', ok: false }));
    return;
  }

  if (msg.type === 'GET_NOTIFICATIONS') {
    getMyNotifications()
      .then((r) => post({ type: 'NOTIFICATIONS_RESULT', ...r }))
      .catch(() => post({ type: 'NOTIFICATIONS_RESULT', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'MARK_NOTIFICATION_READ') {
    markNotificationRead({ notificationId: msg.notificationId })
      .then((r) => post({ type: 'NOTIFICATION_READ_RESULT', ...r }))
      .catch(() => {});
    return;
  }

  if (msg.type === 'READ_ALL_NOTIFICATIONS') {
    readAllMyNotifications()
      .then((r) => post({ type: 'NOTIFICATIONS_READ_ALL_RESULT', ...r }))
      .catch(() => {});
    return;
  }

  if (msg.type === 'DELETE_NOTIFICATION') {
    deleteMyNotification({ notificationId: msg.notificationId })
      .then((r) => post({ type: 'NOTIFICATION_DELETE_RESULT', ...r }))
      .catch(() => {});
    return;
  }

  if (msg.type === 'GET_MY_TICKETS') {
    getMyTickets()
      .then((r) => post({ type: 'MY_TICKETS', ...r }))
      .catch(() => post({ type: 'MY_TICKETS', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'CREATE_TICKET') {
    createMyTicket({ subject: msg.subject, category: msg.category, message: msg.message, bookingId: msg.bookingId || '' })
      .then((r) => post({ type: 'NEW_TICKET_RESULT', ...r }))
      .catch(() => post({ type: 'NEW_TICKET_RESULT', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'REPLY_TO_TICKET') {
    replyToMyTicket({ ticketId: msg.ticketId, message: msg.message })
      .then((r) => post({ type: 'TICKET_REPLY_RESULT', ...r }))
      .catch(() => post({ type: 'TICKET_REPLY_RESULT', ok: false, error: 'server_error' }));
    return;
  }
}

$w.onReady(async function () {
  let info = await getMemberInfo();
  if (!info) {
    try {
      await authentication.promptLogin({ mode: 'login' });
      info = await getMemberInfo();
    } catch (_) { wixLocation.to('/'); return; }
  }
  if (!info) { wixLocation.to('/'); return; }

  const comp = getComp();
  if (comp) {
    try { comp.onMessage(handleMessage); } catch (e) { console.error('MemberPortal bind failed', e); }
    try { comp.expand(); comp.show(); } catch (_) {}
  }
  sendInit(info);
});
