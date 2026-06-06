import wixLocation from 'wix-location';
import { getFleetBoard, saveVehicleCardData } from 'backend/vehicleCard.jsw';
import { buildUserContext, logoutBackroom, requireBackroomAccess, getSessionToken } from 'public/backroomAuth';
import { isTrustedBridgeOrigin, normalizeBridgeMessage, postMessageSafe, resolveHtmlComponent } from 'public/bridgeUtils';
import { APP_ROUTES as ROUTES } from 'public/appRoutes';
import { collapseHtmlSiblings } from 'public/pageVisibility';

const HTML_IDS = ['#fleetHtml'];
const MIN_HEIGHT = 860;
const MAX_HEIGHT = 5000;
let authState = null;

function logSuppressed(context, error) {
  console.warn(`[Myroom Fleet] ${context}`, error?.message || error || 'unknown error');
}

$w.onReady(async function () {
  authState = await requireBackroomAccess({ area: 'fleet', action: 'View' });
  if (!authState?.ok) return;

  hideOtherComponents(getHtmlIds());

  const html = getHtmlComponent();
  if (!html) return;
  try { html.expand(); html.show(); } catch (error) { logSuppressed('expand/show failed', error); }
  try { html.height = MIN_HEIGHT; } catch (error) { logSuppressed('initial height set failed', error); }

  html.onMessage(async (event) => {
    if (!isTrustedBridgeOrigin(event?.origin, wixLocation.url)) return;
    const msg = normalizeBridgeMessage(event && event.data);
    if (!msg || typeof msg !== 'object' || !msg.type) return;

    if (msg.type === 'requestUserContext') {
      post(buildUserContext(authState, { siteBase: deriveSiteBase() }));
      return;
    }

    if (msg.type === 'requestFleetBoard') {
      await loadFleetBoard();
      return;
    }

    if (msg.type === 'menuAction') {
      const action = String(msg.action || '');
      if (action === 'reload') { await loadFleetBoard(); return; }
      if (action === 'logout') { await logoutBackroom(); wixLocation.to(ROUTES.home); return; }
    }

    if (msg.type === 'navigate') {
      const route = String(msg.route || '');
      if (route === 'home')     return wixLocation.to(ROUTES.home);
      if (route === 'daily')    return wixLocation.to(ROUTES.daily);
      if (route === 'fleet')    return wixLocation.to(ROUTES.fleetboard);
      if (route === 'fleetCal') return wixLocation.to(ROUTES.fleet);
      if (route === 'bookings') return wixLocation.to(ROUTES.bookings);
      if (route === 'customers')return wixLocation.to(ROUTES.customers);
      if (route === 'contract') return wixLocation.to(ROUTES.contract);
      if (route === 'settings') return wixLocation.to(ROUTES.settings);
    }

    if (msg.type === 'resizeShell') {
      const h = clampHeight(Number(msg.height || 0));
      if (h) { try { html.height = h; } catch (error) { logSuppressed('resizeShell height set failed', error); } }
      return;
    }

    if (msg.type === 'saveVehicleCard') {
      const fleetVehicleId = String(msg.fleetVehicleId || '').trim();
      const patch = msg.patch && typeof msg.patch === 'object' ? msg.patch : {};
      if (!fleetVehicleId) { post({ type: 'vehicleCardSaved', success: false, message: 'Missing vehicle ID' }); return; }
      try {
        const res = await saveVehicleCardData({ sessionToken: resolveAuthToken(), fleetVehicleId, patch });
        if (!res?.success) { post({ type: 'vehicleCardSaved', success: false, message: res?.message || 'Save failed' }); return; }
        post({ type: 'vehicleCardSaved', success: true, fleet: res.fleet });
        await loadFleetBoard();
      } catch (error) {
        post({ type: 'vehicleCardSaved', success: false, message: error?.message || String(error) });
      }
      return;
    }

    if (msg.type === 'openVehicleCard') {
      const fleetVehicleId = String(msg.fleetVehicleId || msg.vehicleId || '').trim();
      if (!fleetVehicleId) return;
      const params = new URLSearchParams();
      params.set('fleetVehicleId', fleetVehicleId);
      params.set('from', 'fleet');
      wixLocation.to(`${ROUTES.vehiclecard}?${params.toString()}`);
      return;
    }

    if (msg.type === 'openContract') {
      const bookingId = String(msg.bookingId || '').trim();
      if (!bookingId) return;
      const params = new URLSearchParams();
      params.set('bookingId', bookingId);
      params.set('from', 'fleetboard');
      wixLocation.to(`${ROUTES.contract}?${params.toString()}`);
      return;
    }
  });

  post({ type: 'resume' });
  post(buildUserContext(authState, { siteBase: deriveSiteBase() }));
  await loadFleetBoard();
});

function resolveAuthToken() {
  return String((authState && authState.sessionToken) || getSessionToken() || '').trim();
}

function getHtmlIds() {
  return HTML_IDS.filter((id) => {
    try { return !!$w(id); } catch (error) { logSuppressed(`selector existence check failed for ${id}`, error); return false; }
  });
}

function getHtmlComponent() {
  try { return resolveHtmlComponent($w, getHtmlIds()); } catch (error) { logSuppressed('HtmlComponent lookup failed', error); }
  return null;
}

async function loadFleetBoard() {
  try {
    const res = await getFleetBoard({ sessionToken: resolveAuthToken() });
    if (res?.success === false) {
      post({ type: 'loadFleetBoard', vehicles: [], summary: {}, debug: { message: res.message || 'Fleet board load failed' } });
      return;
    }
    post({
      type: 'loadFleetBoard',
      vehicles: Array.isArray(res?.vehicles) ? res.vehicles : [],
      summary: res?.summary || {}
    });
  } catch (error) {
    logSuppressed('loadFleetBoard failed', error);
    post({ type: 'loadFleetBoard', vehicles: [], summary: {}, debug: { error: error?.message || String(error) } });
  }
}

function post(payload) {
  const html = getHtmlComponent();
  if (!html) return;
  if (!postMessageSafe(html, payload, 'fleet')) logSuppressed('postMessage failed');
}

function hideOtherComponents(keepIds) {
  collapseHtmlSiblings($w, keepIds);
}

function clampHeight(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(value)));
}

function deriveSiteBase() {
  try {
    const u = new URL(wixLocation.url);
    const parts = String(u.pathname || '').split('/').filter(Boolean);
    if (parts.length <= 1) return u.origin;
    return `${u.origin}/${parts.slice(0, -1).join('/')}`;
  } catch (error) {
    logSuppressed('deriveSiteBase failed', error);
    return '';
  }
}
