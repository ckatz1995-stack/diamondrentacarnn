// SETUP IN WIX STUDIO:
// 1. Create a new page with URL /myroom-customers
// 2. Add an HTML iframe element, set source: custom-elements/customersHtml.html
// 3. Set the iframe element ID to #customersHtml
// 4. After Wix assigns a page ID, rename this file to: Customers Board.<wix-page-id>.js

import wixLocation from 'wix-location';
import { searchCustomers, getCustomerCard, updateCustomerCard, getCustomerBookings, getStaffTickets, replyToTicketStaff, setTicketStatus, createMemberNotification } from 'backend/customerCards.jsw';
import { buildUserContext, logoutBackroom, requireBackroomAccess } from 'public/backroomAuth';
import { isTrustedBridgeOrigin, normalizeBridgeMessage, postMessageSafe, resolveHtmlComponent } from 'public/bridgeUtils';
import { APP_ROUTES as ROUTES } from 'public/appRoutes';
import { collapseHtmlSiblings } from 'public/pageVisibility';

const HTML_ID = '#customersHtml';
const MIN_HEIGHT = 900;
const MAX_HEIGHT = 6000;
let authState = null;

function logErr(ctx, err) {
  console.warn(`[Customers Board] ${ctx}`, err?.message || err || 'unknown');
}

$w.onReady(async function () {
  authState = await requireBackroomAccess({ area: 'customers', action: 'View' });
  if (!authState?.ok) return;

  collapseHtmlSiblings($w, [HTML_ID]);
  const html = getHtml();
  if (!html) return;
  try { html.expand(); html.show(); } catch (err) { logErr('expand/show', err); }
  try { html.height = 1700; } catch (err) { logErr('initial height', err); }

  html.onMessage(async (event) => {
    if (!isTrustedBridgeOrigin(event?.origin, wixLocation.url)) return;
    const msg = normalizeBridgeMessage(event && event.data);
    if (!msg || typeof msg !== 'object' || !msg.type) return;

    if (msg.type === 'requestUserContext') {
      post(buildUserContext(authState));
      return;
    }

    if (msg.type === 'navigate') {
      const route = String(msg.route || '');
      if (route === 'home') return wixLocation.to(ROUTES.home);
      if (route === 'daily') return wixLocation.to(ROUTES.daily);
      if (route === 'fleet') return wixLocation.to(ROUTES.fleetboard);
      if (route === 'fleetCal') return wixLocation.to(ROUTES.fleet);
      if (route === 'bookings') return wixLocation.to(ROUTES.bookings);
      if (route === 'contract') return wixLocation.to(ROUTES.contract);
      if (route === 'customers') return wixLocation.to(ROUTES.customers);
      if (route === 'settings') return wixLocation.to(ROUTES.settings);
      return;
    }

    if (msg.type === 'resizeShell') {
      const h = clamp(Number(msg.height || 0));
      if (h) { try { html.height = h; } catch (err) { logErr('resizeShell', err); } }
      return;
    }

    if (msg.type === 'menuAction') {
      if (String(msg.action || '') === 'logout') {
        await logoutBackroom();
        wixLocation.to(ROUTES.home);
      }
      return;
    }

    if (msg.type === 'searchCustomers') {
      try {
        const res = await searchCustomers({ authToken: authState.sessionToken, q: msg.q || '', limit: msg.limit || 40, skip: msg.skip || 0 });
        post({ type: 'customersResult', ...res });
      } catch (err) {
        logErr('searchCustomers', err);
        post({ type: 'customersResult', ok: false, items: [], total: 0 });
      }
      return;
    }

    if (msg.type === 'getCustomerCard') {
      try {
        const res = await getCustomerCard({ authToken: authState.sessionToken, customerId: msg.customerId });
        post({ type: 'customerCardResult', ...res });
      } catch (err) {
        logErr('getCustomerCard', err);
        post({ type: 'customerCardResult', ok: false, error: 'server_error' });
      }
      return;
    }

    if (msg.type === 'updateCustomerCard') {
      try {
        const res = await updateCustomerCard({ authToken: authState.sessionToken, ...(msg.data || {}) });
        post({ type: 'updateCustomerResult', ...res });
      } catch (err) {
        logErr('updateCustomerCard', err);
        post({ type: 'updateCustomerResult', ok: false, error: 'server_error' });
      }
      return;
    }

    if (msg.type === 'getCustomerBookings') {
      try {
        const res = await getCustomerBookings({ authToken: authState.sessionToken, customerId: msg.customerId, email: msg.email });
        post({ type: 'customerBookingsResult', ...res });
      } catch (err) {
        logErr('getCustomerBookings', err);
        post({ type: 'customerBookingsResult', ok: true, bookings: [] });
      }
      return;
    }

    if (msg.type === 'getStaffTickets') {
      try {
        const res = await getStaffTickets({ authToken: authState.sessionToken, status: msg.status || '', customerId: msg.customerId || '', email: msg.email || '' });
        post({ type: 'staffTicketsResult', ...res });
      } catch (err) {
        logErr('getStaffTickets', err);
        post({ type: 'staffTicketsResult', ok: true, tickets: [] });
      }
      return;
    }

    if (msg.type === 'replyToTicket') {
      try {
        const res = await replyToTicketStaff({ authToken: authState.sessionToken, ticketId: msg.ticketId, message: msg.message });
        post({ type: 'ticketReplyResult', ...res });
      } catch (err) {
        logErr('replyToTicketStaff', err);
        post({ type: 'ticketReplyResult', ok: false, error: 'server_error' });
      }
      return;
    }

    if (msg.type === 'setTicketStatus') {
      try {
        const res = await setTicketStatus({ authToken: authState.sessionToken, ticketId: msg.ticketId, status: msg.status });
        post({ type: 'ticketStatusResult', ...res });
      } catch (err) {
        logErr('setTicketStatus', err);
        post({ type: 'ticketStatusResult', ok: false, error: 'server_error' });
      }
      return;
    }

    if (msg.type === 'createNotification') {
      try {
        const res = await createMemberNotification({ authToken: authState.sessionToken, ...(msg.data || {}) });
        post({ type: 'notificationResult', ...res });
      } catch (err) {
        logErr('createMemberNotification', err);
        post({ type: 'notificationResult', ok: false, error: 'server_error' });
      }
      return;
    }
  });

  post(buildUserContext(authState));
  post({ type: 'resume' });
});

function post(payload) {
  const html = getHtml();
  if (!html) return;
  if (!postMessageSafe(html, payload, 'customers-board')) logErr('postMessage failed');
}

function getHtml() {
  try { return resolveHtmlComponent($w, [HTML_ID]); } catch (err) { logErr('HtmlComponent lookup', err); return null; }
}

function clamp(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(value)));
}
