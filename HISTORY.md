# Diamond Rent A Car — Project History

This file summarizes all work done in the previous repo (`diamondrentacarnew`) before migrating to this one (`diamondrentacarnn`). Use it as context for ongoing development.

---

## Overview

- **Repo:** `ckatz1995-stack/diamondrentacarnew`
- **Period:** May 16 – May 26, 2026
- **Stack:** Wix/Velo (Wix platform, backend `.jsw` files, frontend page JS)
- **Total commits:** ~100

---

## 1. Security Audit & Fixes (May 16 – May 24)

### Origin / Trust Checks
- Fixed `isTrustedParentOrigin` to also trust custom domain sites via `document.referrer`.

### XSS Fixes
- Fixed incomplete HTML-escape helpers and unescaped `innerHTML` in backroom UIs.
- Fixed stored XSS in `vehicles.html` vehicle selection button.
- Fixed `innerHTML` in `options.html`.

### suppressAuth Fixes
- Added `suppressAuth: true` to all `wixData` calls in:
  - `http-functions.js`
  - `bookingEngine.jsw`
  - `pricingAdmin.jsw`
  - `rentalContract.jsw`
  - `fleetCalendar.jsw`
- Full CMS permission lockdown applied.

### Session Cleanup
- Added session cleanup — both manual and a weekly scheduled job (`jobs.config`).

### Cascading Import Fixes (wix-fetch / wix-secrets)
- Isolated `wix-fetch` / `wix-secrets` imports to `telegramService.jsw` only, eliminating cascading import errors across other backend files.
- Removed `staffAccess` import from `pricingCatalog.jsw` to end all cascades.

### Temporary Diagnostic Endpoints (later removed)
- Added and then removed a temporary CMS audit endpoint.
- Added and then removed a Telegram diagnostic endpoint.
- Added and then removed a `get_ping` diagnostic for HTTP 404 isolation.

---

## 2. Telegram Booking Notifications (May 24)

- Integrated Telegram notifications on new booking creation via `telegramService.jsw`.
- Notification includes:
  - Customer name, vehicle, dates
  - Insurance and extras
  - Origin city and flight info
  - Customer comments
  - Pickup/dropoff location
- Fixed duplicate notification calls (was firing twice — resolved).
- Fixed async data hook to ensure notification fires correctly.
- Fixed `jobs.config` — removed leading slash from `functionLocation`.

---

## 3. Checkout Page — Context-Aware Fields (May 24)

- Checkout form now shows/hides fields based on pickup location type (airport vs. city etc.).
- Location type detection using row key + accent-stripped comparison.
- Added independent dropoff location field with context-aware label.
- Fields update dynamically when booking context changes.
- CMS-driven checkout field config per pickup location (admin can configure labels per location).
- Added checkout field config UI to the pickup location admin modal.
- Bridged `Booking` and `Success` pages to use `bridgeUtils` for consistency.

---

## 4. UI / Design Overhaul (May 25)

Multiple design iterations were applied across the homepage and all booking pages.

### Homepage
- Added section kickers, circle icons, card depth and hover effects.
- Hero section redesign (tried 2-column, reverted to single-column to keep car image visible).
- Added stats trust bar, scroll arrow, and fade-in animations.
- Added fleet grid, customer reviews section, and CTA strip.
- Ghost numerals on process steps, timeline-style step layout.
- Removed emoji from all text.
- Cleaned typography and card styling.

### All Booking Pages (Categories, Booking, Options, Checkout, Success)
- Applied consistent dark teal header and footer across all pages.
- Multiple full design iterations:
  1. Dark teal uniform style
  2. Alternating dark/warm sections
  3. Professional neutral (white cards, teal CTAs)
  4. Luxury dark warm (mahogany body, ivory cards, amber gold accent)
  5. Warm amber Mediterranean (golden amber body)
- Final settled style: professional clean with white/neutral cards and teal CTA color.

### Header & Footer
- Full header and footer redesign applied consistently across all pages.

---

## 5. Run Skill / Smoke Tests (May 25)

- Added a `run` skill (`run-diamondrentacarnew`) with a Playwright-based smoke driver.
- Covers all booking UI pages (33 checks, 0 failures at time of creation).

---

## 6. Member Portal (May 26)

- Added customer self-service member portal.
- Files added:
  - `src/backend/MemberPortal.js` — backend portal config/helpers
  - `src/backend/memberPortal.jsw` — server-side exposed web methods
  - `src/pages/MemberPortal.js` (old repo page file)
- Features: customers can view and manage their own bookings after login.
- Merged via PR #238.

---

## 7. Manual Uploads by Owner (May 26)

- Several files uploaded directly via GitHub UI by `ckatz1995-stack`.
- Included updates to `index.html` and other public assets.
- A zip file was uploaded and then deleted.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/backend/bookingEngine.jsw` | Core booking creation, availability, pricing logic |
| `src/backend/http-functions.js` | Public HTTP API endpoints (REST) |
| `src/backend/memberPortal.jsw` | Member portal — customer-facing booking queries |
| `src/backend/MemberPortal.js` | Member portal helpers/config |
| `src/backend/telegramService.jsw` | Telegram notification integration |
| `src/backend/staffAccess.jsw` | Staff/admin access control |
| `src/backend/pricingAdmin.jsw` | Admin pricing management |
| `src/backend/pricingCatalog.jsw` | Customer-facing pricing catalog |
| `src/backend/rentalContract.jsw` | Rental contract generation |
| `src/backend/fleetCalendar.jsw` | Fleet availability calendar |
| `src/backend/dailyOps.jsw` | Daily operations logic |
| `src/backend/bookingsBoard.jsw` | Bookings board (admin view) |
| `src/backend/bookingConfig.js` | Booking configuration constants |
| `src/backend/siteConfig.js` | Site-wide config |
| `src/backend/billableDays.js` | Billable days calculation |
| `src/backend/pricingSnapshot.js` | Pricing snapshot utility |
| `src/backend/jobs.config` | Scheduled jobs (session cleanup, etc.) |
| `src/backend/data.js` | Wix data hooks |
| `src/backend/utils.js` | Shared utilities |
| `src/pages/masterPage.js` | Global page logic (navigation, auth) |
| `src/pages/Home Page.l2zf7.js` | Homepage |
| `src/pages/Home Login.gxie4.js` | Homepage with login |
| `src/pages/Categories.qtahg.js` | Vehicle category selection |
| `src/pages/Booking.q77ve.js` | Date/location booking form |
| `src/pages/Options.i5rsb.js` | Insurance & extras selection |
| `src/pages/Checkout.c371l.js` | Checkout + customer details |
| `src/pages/Success.tk6s9.js` | Booking confirmation |
| `src/pages/Contract.cysy3.js` | Rental contract view |
| `src/pages/Vehiclecard.i3kns.js` | Vehicle detail card |
| `src/pages/Daily View.yjgoi.js` | Daily operations view |
| `src/pages/Fleet Chart.ed11o.js` | Fleet availability chart |
| `src/pages/Booking Board.vjirh.js` | Admin bookings board |
| `src/pages/Dashboard.eh252.js` | Admin dashboard |
| `src/pages/Account Settings.ehaf1.js` | Customer account settings |
| `src/pages/Myroom.exiuw.js` | Customer "My Room" portal area |
| `src/pages/MembersLogIn.jcogz.js` | Members login page |
| `src/pages/Rental Terms.gd1k0.js` | Rental terms page |
| `src/public/` | Static public assets (HTML/CSS/JS for embedded widgets) |
