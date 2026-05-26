import wixLocation from "wix-location";
import { authentication, currentMember } from "wix-members-frontend";
import { getPublicPricingCatalog } from "backend/pricingCatalog.jsw";
import { getVehicleCategoriesCatalog } from "backend/bookingEngine";
import { getExtendedProfile } from 'backend/memberPortal.jsw';
import { BRIDGE_TYPES, buildBookingContext, isTrustedBridgeOrigin, normalizeBridgeMessage, postMessageSafe, resolveHtmlComponent } from "public/bridgeUtils";
const COMP = "#bpage1";

let pricingCatalog = null;
let vehicleCategories = [];
let pricingPromise = null;
let categoriesPromise = null;
let bridgeReadyAck = false;

function go(path) {
  if (!path) return;
  try { wixLocation.to(String(path)); } catch (err) { console.error("Home navigation failed", err); }
}

function getComponent(){
  return resolveHtmlComponent($w, [COMP]);
}

function post(payload){
  return postMessageSafe(getComponent(), payload, "Home Page");
}

function mapAuthError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('incorrect')) return 'invalid_credentials';
  if (msg.includes('exist') || msg.includes('already')) return 'email_exists';
  if (msg.includes('weak')) return 'weak_password';
  if (msg.includes('not found') || msg.includes('no member')) return 'not_found';
  return 'server_error';
}

async function getMemberInfo() {
  try {
    const member = await currentMember.getMember({ fieldsets: ['FULL'] });
    if (!member) return null;
    const d = member.contactDetails || {};
    return {
      name: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
      email: (d.emails && d.emails[0]) || member.loginEmail || '',
      memberId: member._id || ''
    };
  } catch (_) { return null; }
}

async function ensurePricingCatalog(){
  if (pricingCatalog) return pricingCatalog;
  if (pricingPromise) return pricingPromise;
  pricingPromise = getPublicPricingCatalog()
    .then((data)=>{ pricingCatalog = data || null; return pricingCatalog; })
    .catch((err)=>{ console.warn("Home pricing catalog unavailable", err); pricingCatalog = null; return null; })
    .finally(()=>{ pricingPromise = null; });
  return pricingPromise;
}

async function ensureVehicleCategories(){
  if (vehicleCategories.length) return vehicleCategories;
  if (categoriesPromise) return categoriesPromise;
  categoriesPromise = getVehicleCategoriesCatalog()
    .then((items)=>{ vehicleCategories = Array.isArray(items) ? items : []; return vehicleCategories; })
    .catch((err)=>{ console.warn("Home categories unavailable", err); vehicleCategories = []; return []; })
    .finally(()=>{ categoriesPromise = null; });
  return categoriesPromise;
}

async function syncData(){
  const [catalog, categories] = await Promise.all([ensurePricingCatalog(), ensureVehicleCategories()]);
  post({ type: BRIDGE_TYPES.PRICING, catalog: catalog || null });
  post({ type: "pickup-locations-data", items: Array.isArray(catalog?.pickupLocations) ? catalog.pickupLocations : [] });
  post({ type: "vehicle-categories-data", items: categories || [] });
  post(buildBookingContext(wixLocation));
}

function handleMessage(event) {
  const origin = String(event?.origin || '').trim();
  if (origin && !isTrustedBridgeOrigin(origin, wixLocation.url)) return;
  const data = normalizeBridgeMessage(event && event.data);
  if (!data) return;
  if (data.type === "home-ready" || data.type === "bridge-ready") {
    bridgeReadyAck = true;
    syncData();
    return;
  }
  if (data.type === BRIDGE_TYPES.WIX_NAV && data.path) { go(data.path); return; }
  if (data.type === BRIDGE_TYPES.REQUEST_CONTEXT) {
    post(buildBookingContext(wixLocation));
    return;
  }
  if (data.type === BRIDGE_TYPES.REQUEST_PRICING) { ensurePricingCatalog().then((catalog)=>post({ type: BRIDGE_TYPES.PRICING, catalog: catalog || null })); return; }
  if (data.type === "request-pickup-locations-data") { ensurePricingCatalog().then((catalog)=>post({ type: "pickup-locations-data", items: Array.isArray(catalog?.pickupLocations) ? catalog.pickupLocations : [] })); return; }
  if (data.type === "request-vehicle-categories-data") { ensureVehicleCategories().then((items)=>post({ type: "vehicle-categories-data", items: items || [] })); return; }

  if (data.type === 'REQUEST_MEMBER_STATE') {
    Promise.all([getMemberInfo(), getExtendedProfile().catch(() => null)])
      .then(([info, ext]) => {
        const driverAge = (ext && ext.ok && ext.extended && ext.extended.driverAge) || '';
        const member = info ? { ...info, driverAge } : null;
        post({ type: 'PORTAL_MEMBER_STATE', loggedIn: !!info, member });
      });
    return;
  }

  if (data.type === 'PORTAL_LOGIN') {
    (async () => {
      try {
        await authentication.login(String(data.email || '').trim(), String(data.password || ''));
        const info = await getMemberInfo();
        post({ type: 'PORTAL_AUTH_RESULT', ok: true, member: info });
      } catch (err) {
        post({ type: 'PORTAL_AUTH_RESULT', ok: false, error: mapAuthError(err) });
      }
    })();
    return;
  }

  if (data.type === 'PORTAL_REGISTER') {
    (async () => {
      try {
        const result = await authentication.register(
          String(data.email || '').trim(),
          String(data.password || ''),
          { contactInfo: { firstName: String(data.firstName || '').trim(), lastName: String(data.lastName || '').trim() } }
        );
        const info = await getMemberInfo();
        const isPending = result?.status === 'PENDING' || info === null;
        post({ type: 'PORTAL_AUTH_RESULT', ok: true, member: info, pending: isPending });
      } catch (err) {
        post({ type: 'PORTAL_AUTH_RESULT', ok: false, error: mapAuthError(err) });
      }
    })();
    return;
  }

  if (data.type === 'PORTAL_SIGN_OUT') {
    (async () => {
      try { await authentication.logout(); } catch (_) {}
      post({ type: 'PORTAL_SIGN_OUT_RESULT' });
    })();
    return;
  }
}

$w.onReady(async function () {
  const comp = getComponent();
  if (comp) {
    try { comp.onMessage(handleMessage); } catch (e) { console.error("Bind home html onMessage failed", e); }
  }
  await syncData();
  Promise.all([getMemberInfo(), getExtendedProfile().catch(() => null)]).then(([info, ext]) => {
    if (info) {
      const driverAge = (ext && ext.ok && ext.extended && ext.extended.driverAge) || '';
      post({ type: 'PORTAL_MEMBER_STATE', loggedIn: true, member: { ...info, driverAge } });
    }
  });
  setTimeout(() => {
    if (!bridgeReadyAck) syncData();
  }, 1200);
  if (typeof window !== "undefined") {
    window.addEventListener("message", (event) => {
      if (!isTrustedBridgeOrigin(event?.origin, wixLocation.url)) return;
      const data = normalizeBridgeMessage(event && event.data);
      if (!data) return;
      if (data.type === BRIDGE_TYPES.WIX_NAV && data.path) go(data.path);
      if (data.type === BRIDGE_TYPES.REQUEST_CONTEXT) post(buildBookingContext(wixLocation));
      if (data.type === BRIDGE_TYPES.REQUEST_PRICING) ensurePricingCatalog().then((catalog)=>post({ type: BRIDGE_TYPES.PRICING, catalog: catalog || null }));
      if (data.type === "request-pickup-locations-data") ensurePricingCatalog().then((catalog)=>post({ type: "pickup-locations-data", items: Array.isArray(catalog?.pickupLocations) ? catalog.pickupLocations : [] }));
      if (data.type === "request-vehicle-categories-data") ensureVehicleCategories().then((items)=>post({ type: "vehicle-categories-data", items: items || [] }));
    });
  }
});
