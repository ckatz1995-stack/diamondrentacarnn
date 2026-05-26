// SETUP IN WIX STUDIO:
// 1. Rename this page to "Ο Λογαριασμός μου" and set its URL to /member-portal
// 2. Add an HTML iframe element to the page
// 3. Set the iframe src to: member-portal/portal.html
// 4. Set the iframe element ID to: #mbrPortalHtml

import wixLocation from 'wix-location';
import { authentication, currentMember } from 'wix-members-frontend';
import { getMyBookings, getMyProfile } from 'backend/memberPortal.jsw';
import { isTrustedBridgeOrigin, normalizeBridgeMessage, postMessageSafe, resolveHtmlComponent } from 'public/bridgeUtils';

const COMP_IDS = ['#mbrPortalHtml', '#html1', '#html2', '#html3', '#htmlComponent1', '#htmlComp1', '#htmlComp', '#iframeComp', '#bpage1', '#bpage2'];

function getComp() { return resolveHtmlComponent($w, COMP_IDS); }
function post(payload) { return postMessageSafe(getComp(), payload, 'MemberPortal'); }

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

function handleMessage(event) {
  const origin = String(event?.origin || '').trim();
  if (origin && !isTrustedBridgeOrigin(origin, wixLocation.url)) return;
  const msg = normalizeBridgeMessage(event && event.data);
  if (!msg || !msg.type) return;

  if (msg.type === 'PORTAL_READY' || msg.type === 'bridge-ready') {
    getMemberInfo().then((info) => {
      if (info) post({ type: 'MEMBER_INIT', member: info });
    });
    return;
  }

  if (msg.type === 'REQUEST_MY_BOOKINGS') {
    getMyBookings(msg.filter || null)
      .then((result) => post({ type: 'MY_BOOKINGS', ...result }))
      .catch(() => post({ type: 'MY_BOOKINGS', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'REQUEST_MY_PROFILE') {
    getMyProfile()
      .then((result) => post({ type: 'MY_PROFILE', ...result }))
      .catch(() => post({ type: 'MY_PROFILE', ok: false, error: 'server_error' }));
    return;
  }

  if (msg.type === 'MEMBER_PORTAL_NAV') {
    if (msg.path) {
      try { wixLocation.to(String(msg.path)); } catch (_) {}
    }
    return;
  }
}

$w.onReady(async function () {
  let info = await getMemberInfo();
  if (!info) {
    try {
      await authentication.promptLogin({ mode: 'login' });
      info = await getMemberInfo();
    } catch (_) {
      wixLocation.to('/');
      return;
    }
  }
  if (!info) { wixLocation.to('/'); return; }

  const comp = getComp();
  if (comp) {
    try { comp.onMessage(handleMessage); } catch (e) { console.error('MemberPortal bind failed', e); }
    try { comp.expand(); comp.show(); } catch (_) {}
  }
  post({ type: 'MEMBER_INIT', member: info });
});
