# DIAMOND Rent A Car — Front Site Description

## Overview

The customer-facing front site is a multi-step booking flow embedded as iframes inside the Wix site. All pages share a consistent premium dark-teal header, warm amber/gold body background, and a member portal button (login/register). The booking flow is linear but every page has full navigation so users can jump between steps.

---

## Pages

### 1. Home — `index.html`
The landing page and booking entry point.

**What the user sees:**
- Brand hero with the tagline *"Drive Northern Greece, your way"* and three trust badges (no deposit, fast confirmation, personal service)
- A booking search form with: pickup location, dropoff location, pickup date & time, dropoff date & time, vehicle category, and driver age
- Company stats strip: 5+ years, 50+ vehicles, 6 service points, 24/7 support
- Fleet overview cards for the main categories (Economy, Comfort, Premium, SUV)

**Interactions:**
- Fills out search form → navigates to vehicle selection
- Location dropdown lists: airport, city centre, port, hotels, train station
- Category filter: Economy (A), Comfort (B), Luxury (LX), or all
- Driver age affects pricing (19–22, 23–69, 70+)

---

### 2. Vehicle Selection — `vehicles.html`
Browse and choose a vehicle category matching the search.

**What the user sees:**
- Search bar at the top to adjust dates/locations without going back
- Result cards per category: photo, category badge, specs (seats, luggage, transmission), price per day, total rental cost
- Expandable model details showing example cars in the category

**Interactions:**
- Modify search parameters inline
- Select a category card → proceeds to insurance & extras

---

### 3. Insurance & Extras — `options.html`
Select coverage and optional add-ons.

**What the user sees:**
- Sticky header with the selected vehicle card: image, category, rental dates, duration
- A note explaining that the customer books a *category*, not a specific car
- Three insurance tiers (radio buttons):
  - **CDW** — 0 €/day (basic liability)
  - **SCDW** — 12 €/day (reduced liability)
  - **FULL** — 20 €/day (zero excess)
- Extras checkboxes: baby seat, child seat, additional driver, GPS, etc. (each with per-day pricing)
- Running total summary panel

**Interactions:**
- Pick one insurance tier
- Check any combination of extras
- Continue button → checkout

---

### 4. Checkout — `checkout.html`
Enter customer details and submit the booking.

**What the user sees:**
- Order summary shell: vehicle image, category badge, price/day, 4-cell grid (pickup, dropoff, insurance, extras)
- Itemised cost breakdown: base charge, insurance, extras, location fee, age surcharge, night fee, **grand total**
- Driver details form: first name, last name, DOB, phone, email, country, address, city, postcode
- Conditional fields: flight number + origin city (shown only for airport pickup)
- Document type toggle: **Receipt** (simple) or **Invoice** (unlocks company name, VAT number, tax office, profession, billing address)
- Special requests textarea
- Terms & conditions checkbox (required)
- Submit button with a spinner overlay while the booking is being sent

**Interactions:**
- Inline validation — styled error banner replaces browser `alert()`
- Invoice fields slide in/out based on document type selection
- On success → navigates to the success page

---

### 5. Booking Success — `success.html`
Confirmation screen after a successful booking submission.

**What the user sees:**
- Success heading confirming the request was received
- Booking reference number displayed prominently
- Full summary repeat: vehicle, pickup/dropoff details, insurance, extras, cost breakdown
- "Next steps" section: save your reference, expect a confirmation call/email from the team

**Interactions:**
- Buttons to start a new search or go back to vehicle selection
- Member portal button — if logged in, customer can go directly to their bookings tab

---

### 6. Rental Terms — `terms.html`
Full rental terms and policy reference page.

**What the user sees:**
- Hero card with page title
- Four collapsible policy sections:
  1. General Terms
  2. Driver Requirements & Security Deposit
  3. Usage, Cancellation & Delivery Policies
  4. Personal Data & Other Information
- Sticky side card with: contact phone, email, office address, insurance plan summaries
- Quick-action buttons to jump to insurance/extras or straight to checkout

**Interactions:**
- Expand/collapse each section
- Side card links connect to relevant booking steps

---

### 7. Member Login — `memberslogin.html`
Dedicated login page for members accessing the portal.

**What the user sees:**
- Centered card on a dark background
- DIAMOND gold diamond logo mark
- "Member Portal" heading
- Email + password fields, sign-in button, error area

**Interactions:**
- Submits credentials → on success, redirects into the member portal
- Distinct dark theme separating it visually from the booking flow

---

## Shared Header

Every page has a sticky dark-teal header containing:
- **Brand mark** — gold ◆ diamond + "DIAMOND Rent A Car / Thessaloniki"
- **Navigation links** — Αρχική, Οχήματα, Extras, Όροι ενοικίασης, Ολοκλήρωση
- **Phone number** — gold pill button (`+30 2310 000 000`)
- **Member portal button** — "Σύνδεση" pill; turns gold with the member's first name when logged in; opens a login/register modal when clicked while logged out, or a dropdown (bookings, profile, settings, logout) when logged in

---

## Booking Flow Summary

```
Home (search form)
  └─► Vehicle Selection
        └─► Insurance & Extras
              └─► Checkout (driver details + submit)
                    └─► Success (confirmation)
```

Terms page is accessible from any step via the navigation. The member portal button is present on every page.
