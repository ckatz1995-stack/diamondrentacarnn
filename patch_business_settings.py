#!/usr/bin/env python3
"""
Applies all missing-tabs + comprehensive business settings panes to pricingAdminHtml.
"""

FILE = '/home/user/diamondrentacarnn/src/public/custom-elements/pricingAdminHtml'

with open(FILE, 'r') as f:
    content = f.read()

original_len = len(content)

# ============================================================
# 1. Fix tabs-fallback: add roles/users/security/audit
# ============================================================
OLD_TABS = '''      <div class="tabs-fallback" id="tabsFallback">
        <button class="tab active" data-tab="settingsHome">Overview</button>
        <button class="tab" data-tab="business">Business control</button>
        <button class="tab" data-tab="fleetCategories">Fleet categories</button>
        <button class="tab" data-tab="fleetVehicles">Fleet vehicles</button>
        <button class="tab" data-tab="dynamicPricing">Dynamic pricing</button>
        <button class="tab" data-tab="insurance">Insurance plans</button>
        <button class="tab" data-tab="extras">Extra services</button>
        <button class="tab" data-tab="fees">Fee rules</button>
      </div>'''

NEW_TABS = '''      <div class="tabs-fallback" id="tabsFallback">
        <button class="tab active" data-tab="settingsHome">Overview</button>
        <button class="tab" data-tab="business">Business control</button>
        <button class="tab" data-tab="fleetCategories">Fleet categories</button>
        <button class="tab" data-tab="fleetVehicles">Fleet vehicles</button>
        <button class="tab" data-tab="dynamicPricing">Dynamic pricing</button>
        <button class="tab" data-tab="insurance">Insurance plans</button>
        <button class="tab" data-tab="extras">Extra services</button>
        <button class="tab" data-tab="fees">Fee rules</button>
        <button class="tab" data-tab="roles">Roles</button>
        <button class="tab" data-tab="users">Users</button>
        <button class="tab" data-tab="security">Security</button>
        <button class="tab" data-tab="audit">Change history</button>
      </div>'''

assert OLD_TABS in content, "ERROR: tabs-fallback block not found"
content = content.replace(OLD_TABS, NEW_TABS, 1)
print("✓ 1. Fixed tabs-fallback")

# ============================================================
# 2. Fix BUSINESS_AREAS: add policies area
# ============================================================
OLD_AREAS = '''    const BUSINESS_AREAS = [
      { key:'front', label:'Front & content' },
      { key:'operations', label:'Operations & policy' },
      { key:'company', label:'Company & stations' },
      { key:'communications', label:'Notifications' }
    ];'''

NEW_AREAS = '''    const BUSINESS_AREAS = [
      { key:'front', label:'Front & content' },
      { key:'operations', label:'Operations & policy' },
      { key:'policies', label:'Rental policies' },
      { key:'company', label:'Company & stations' },
      { key:'communications', label:'Notifications' }
    ];'''

assert OLD_AREAS in content, "ERROR: BUSINESS_AREAS not found"
content = content.replace(OLD_AREAS, NEW_AREAS, 1)
print("✓ 2. Updated BUSINESS_AREAS")

# ============================================================
# 3. Fix BUSINESS_PANES: add new panes
# ============================================================
OLD_PANES_END = "      { key:'seoPages', area:'front', label:'6. SEO & pages', shortLabel:'SEO', helper:'Per-page titles, meta descriptions, OG image, Google Analytics and Tag Manager IDs.' }\n    ];"
NEW_PANES_END = """      { key:'seoPages', area:'front', label:'6. SEO & pages', shortLabel:'SEO', helper:'Per-page titles, meta descriptions, OG image, Google Analytics and Tag Manager IDs.' },
      { key:'socialContact', area:'front', label:'7. Social & contact links', shortLabel:'Social', helper:'Facebook, Instagram, WhatsApp, Google Maps and other online presence links shown on the front site.' },
      { key:'additionalDriver', area:'operations', label:'4. Additional driver policy', shortLabel:'Add. driver', helper:'Additional driver allowance, fees and minimum age/license requirements.' },
      { key:'mileagePolicy', area:'policies', label:'1. Mileage & km policy', shortLabel:'Mileage', helper:'Unlimited vs limited mileage, included km per day, extra km rate, late return fees and one-way rental.' },
      { key:'damageExcess', area:'policies', label:'2. Damage excess & coverage', shortLabel:'Damage excess', helper:'Default damage excess, CDW, SCDW, theft protection and glass/tire cover options and daily rates.' },
      { key:'corporateB2B', area:'company', label:'3. Corporate & B2B', shortLabel:'Corporate', helper:'Corporate account settings, agent commissions, B2B invoicing and contact details.' },
      { key:'privacyGdpr', area:'company', label:'4. Privacy & GDPR', shortLabel:'Privacy / GDPR', helper:'Privacy policy text, GDPR consent, cookie policy, data retention and DPO contact.' }
    ];"""

assert OLD_PANES_END in content, "ERROR: BUSINESS_PANES end not found"
content = content.replace(OLD_PANES_END, NEW_PANES_END, 1)
print("✓ 3. Updated BUSINESS_PANES")

# ============================================================
# 4. Insert new HTML panes before closing of settings-stack
# ============================================================
# Marker: the closing </div> of group-seoPages (14 spaces) followed by
# empty line then closing </div> of settings-stack (12 spaces).
PANE_INSERT_MARKER = '              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n\n<section class="section" data-section="fleetCategories">'

NEW_PANES_HTML = '''              </div>

              <div class="settings-group business-pane" id="group-socialContact" data-group-anchor="socialContact" data-business-pane="socialContact">
                <div class="settings-group-head">
                  <div>
                    <h3>7. Social media &amp; contact links</h3>
                    <p>Online presence links that appear on the front site, footer and booking confirmations.</p>
                  </div>
                  <div class="settings-group-badge">Social</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Social media</label></div>
                  <div class="field col-4"><label>Facebook page URL</label><input id="bsFacebookUrl" placeholder="https://facebook.com/diamondrentacar" /></div>
                  <div class="field col-4"><label>Instagram URL</label><input id="bsInstagramUrl" placeholder="https://instagram.com/diamondrentacar" /></div>
                  <div class="field col-4"><label>TikTok URL</label><input id="bsTiktokUrl" placeholder="https://tiktok.com/@diamondrentacar" /></div>
                  <div class="field col-4"><label>Twitter / X URL</label><input id="bsTwitterUrl" placeholder="https://x.com/diamondrentacar" /></div>
                  <div class="field col-4"><label>LinkedIn URL</label><input id="bsLinkedinUrl" placeholder="https://linkedin.com/company/diamondrentacar" /></div>
                  <div class="field col-4"><label>YouTube channel URL</label><input id="bsYoutubeUrl" placeholder="https://youtube.com/@diamondrentacar" /></div>
                  <div class="field col-12"><label class="field-sub-header">Direct contact &amp; maps</label></div>
                  <div class="field col-4"><label>WhatsApp number</label><input id="bsWhatsappNumber" placeholder="+30 6900 000000" /></div>
                  <div class="field col-4"><label>WhatsApp message template</label><input id="bsWhatsappTemplate" placeholder="Hello, I would like to book a car..." /></div>
                  <div class="field col-4"><label>Google Maps link</label><input id="bsGoogleMapsUrl" placeholder="https://goo.gl/maps/..." /></div>
                  <div class="field col-4"><label>Booking platform URL (external)</label><input id="bsBookingPlatformUrl" placeholder="https://booking.com/..." /></div>
                  <div class="field col-4"><label>TripAdvisor / review URL</label><input id="bsReviewUrl" placeholder="https://tripadvisor.com/..." /></div>
                  <div class="field col-4"><label>Website URL</label><input id="bsWebsiteUrl" placeholder="https://diamondrentacar.gr" /></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-additionalDriver" data-group-anchor="additionalDriver" data-business-pane="additionalDriver">
                <div class="settings-group-head">
                  <div>
                    <h3>4. Additional driver policy</h3>
                    <p>Rules and fees for secondary drivers added to a rental agreement.</p>
                  </div>
                  <div class="settings-group-badge">Add. driver</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-4 switch"><input id="bsAllowAdditionalDrivers" type="checkbox" /><label for="bsAllowAdditionalDrivers">Allow additional drivers</label></div>
                  <div class="field col-4"><label>Max additional drivers</label><input id="bsMaxAdditionalDrivers" type="number" min="0" max="5" step="1" placeholder="2" /></div>
                  <div class="field col-4"><div class="info-card">Additional drivers must present their own valid license at pickup.</div></div>
                  <div class="field col-12"><label class="field-sub-header">Fee structure</label></div>
                  <div class="field col-4"><label>Fee type</label><select id="bsAdditionalDriverFeeType"><option value="free">Free of charge</option><option value="fixed">Fixed per rental</option><option value="per-day">Per day per driver</option></select></div>
                  <div class="field col-4"><label>Fee amount</label><input id="bsAdditionalDriverFeeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-4"><div class="info-card">Fee applies per additional driver. Set fee type to Free to waive the charge.</div></div>
                  <div class="field col-12"><label class="field-sub-header">Requirements for additional driver</label></div>
                  <div class="field col-3"><label>Min age</label><input id="bsAdditionalDriverMinAge" type="number" min="16" max="99" step="1" placeholder="21" /></div>
                  <div class="field col-3"><label>Min years holding license</label><input id="bsAdditionalDriverLicenseYears" type="number" min="0" step="1" placeholder="1" /></div>
                  <div class="field col-3 switch"><input id="bsAdditionalDriverRequireLicense" type="checkbox" /><label for="bsAdditionalDriverRequireLicense">Require license copy</label></div>
                  <div class="field col-3 switch"><input id="bsAdditionalDriverAllowInternational" type="checkbox" /><label for="bsAdditionalDriverAllowInternational">Allow international license</label></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-mileagePolicy" data-group-anchor="mileagePolicy" data-business-pane="mileagePolicy">
                <div class="settings-group-head">
                  <div>
                    <h3>1. Mileage &amp; km policy</h3>
                    <p>Unlimited vs. limited mileage, extra km rates, late return fees and one-way rental rules.</p>
                  </div>
                  <div class="settings-group-badge">Mileage</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Mileage type</label></div>
                  <div class="field col-4"><label>Default mileage policy</label><select id="bsMileageType"><option value="unlimited">Unlimited mileage</option><option value="limited">Limited — km per day</option></select></div>
                  <div class="field col-4"><label>Included km per day (if limited)</label><input id="bsIncludedKmPerDay" type="number" min="0" step="1" placeholder="200" /></div>
                  <div class="field col-4"><label>Extra km rate (per km, €)</label><input id="bsExtraKmRate" type="number" min="0" step="0.01" placeholder="0.15" /></div>
                  <div class="field col-12"><label class="field-sub-header">Late return</label></div>
                  <div class="field col-3"><label>Grace period (minutes)</label><input id="bsLateReturnGraceMins" type="number" min="0" step="5" placeholder="30" /></div>
                  <div class="field col-3"><label>Late fee type</label><select id="bsLateReturnFeeType"><option value="none">No late fee</option><option value="hourly">Per hour</option><option value="fixed">Fixed fee</option><option value="daily">Full extra day</option></select></div>
                  <div class="field col-3"><label>Late fee amount (€)</label><input id="bsLateReturnFeeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-3"><div class="info-card">Grace period applies before late fees trigger. Set fee type to None to disable.</div></div>
                  <div class="field col-12"><label class="field-sub-header">One-way rental</label></div>
                  <div class="field col-3 switch"><input id="bsAllowOneWayRental" type="checkbox" /><label for="bsAllowOneWayRental">Allow one-way rentals</label></div>
                  <div class="field col-3"><label>One-way fee type</label><select id="bsOneWayFeeType"><option value="free">Free</option><option value="fixed">Fixed amount</option><option value="percentage">% of rental total</option></select></div>
                  <div class="field col-3"><label>One-way fee amount / %</label><input id="bsOneWayFeeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-3"><div class="info-card">Fee charged when dropoff station differs from pickup station.</div></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-damageExcess" data-group-anchor="damageExcess" data-business-pane="damageExcess">
                <div class="settings-group-head">
                  <div>
                    <h3>2. Damage excess &amp; coverage options</h3>
                    <p>Default damage excess, collision damage waiver (CDW), super CDW (SCDW), theft protection and add-on coverage daily rates.</p>
                  </div>
                  <div class="settings-group-badge">Damage excess</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Basic excess (no coverage)</label></div>
                  <div class="field col-4"><label>Default damage excess (€)</label><input id="bsDefaultDamageExcess" type="number" min="0" step="0.01" placeholder="1500.00" /></div>
                  <div class="field col-4"><label>Theft excess (€)</label><input id="bsTheftExcess" type="number" min="0" step="0.01" placeholder="3000.00" /></div>
                  <div class="field col-4"><div class="info-card">Maximum liability for a renter with no coverage add-on.</div></div>
                  <div class="field col-12"><label class="field-sub-header">CDW — Collision Damage Waiver</label></div>
                  <div class="field col-3 switch"><input id="bsCdwIncluded" type="checkbox" /><label for="bsCdwIncluded">CDW included by default</label></div>
                  <div class="field col-3"><label>CDW reduces excess to (€)</label><input id="bsCdwReducedExcess" type="number" min="0" step="0.01" placeholder="500.00" /></div>
                  <div class="field col-3"><label>CDW daily rate (€)</label><input id="bsCdwDailyRate" type="number" min="0" step="0.01" placeholder="8.00" /></div>
                  <div class="field col-3"><div class="info-card">If not included, CDW appears as a selectable add-on at checkout.</div></div>
                  <div class="field col-12"><label class="field-sub-header">SCDW — Super CDW (full excess waiver)</label></div>
                  <div class="field col-3 switch"><input id="bsScdwIncluded" type="checkbox" /><label for="bsScdwIncluded">SCDW included by default</label></div>
                  <div class="field col-3"><label>SCDW reduces excess to (€)</label><input id="bsScdwReducedExcess" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-3"><label>SCDW daily rate (€)</label><input id="bsScdwDailyRate" type="number" min="0" step="0.01" placeholder="14.00" /></div>
                  <div class="field col-3"><div class="info-card">SCDW typically brings excess to zero — full collision and theft coverage.</div></div>
                  <div class="field col-12"><label class="field-sub-header">Additional coverage options</label></div>
                  <div class="field col-3 switch"><input id="bsTheftProtectionAvailable" type="checkbox" /><label for="bsTheftProtectionAvailable">Theft protection available</label></div>
                  <div class="field col-3"><label>Theft protection daily rate (€)</label><input id="bsTheftProtectionDailyRate" type="number" min="0" step="0.01" placeholder="5.00" /></div>
                  <div class="field col-3 switch"><input id="bsGlassTireRoofAvailable" type="checkbox" /><label for="bsGlassTireRoofAvailable">Glass/Tire/Roof cover available</label></div>
                  <div class="field col-3"><label>Glass/Tire/Roof daily rate (€)</label><input id="bsGlassTireRoofDailyRate" type="number" min="0" step="0.01" placeholder="3.00" /></div>
                  <div class="field col-12"><label>Damage excess policy note (shown at checkout)</label><textarea id="bsDamageExcessNote" placeholder="In the event of an accident, the renter is liable up to the stated excess amount. CDW reduces this liability."></textarea></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-corporateB2B" data-group-anchor="corporateB2B" data-business-pane="corporateB2B">
                <div class="settings-group-head">
                  <div>
                    <h3>3. Corporate accounts &amp; B2B</h3>
                    <p>Corporate pricing, agent commission and business-to-business invoicing settings.</p>
                  </div>
                  <div class="settings-group-badge">Corporate</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-4 switch"><input id="bsEnableCorporateAccounts" type="checkbox" /><label for="bsEnableCorporateAccounts">Enable corporate accounts</label></div>
                  <div class="field col-4 switch"><input id="bsEnableB2BInvoicing" type="checkbox" /><label for="bsEnableB2BInvoicing">Enable B2B invoicing</label></div>
                  <div class="field col-4"><label>B2B contact email</label><input id="bsB2bContactEmail" placeholder="corporate@diamondrentacar.gr" /></div>
                  <div class="field col-12"><label class="field-sub-header">Corporate discount</label></div>
                  <div class="field col-4"><label>Corporate discount type</label><select id="bsCorporateDiscountType"><option value="none">No default discount</option><option value="percentage">Percentage off daily rate</option><option value="fixed-per-day">Fixed amount off per day</option></select></div>
                  <div class="field col-4"><label>Default corporate discount (%)</label><input id="bsCorporateDiscountPercentage" type="number" min="0" max="100" step="0.5" placeholder="10" /></div>
                  <div class="field col-4"><label>Default discount per day (€)</label><input id="bsCorporateDiscountPerDay" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-12"><label class="field-sub-header">Agent / travel agency commission</label></div>
                  <div class="field col-4 switch"><input id="bsEnableAgentCommission" type="checkbox" /><label for="bsEnableAgentCommission">Enable agent commission</label></div>
                  <div class="field col-4"><label>Default agent commission (%)</label><input id="bsAgentCommissionPercentage" type="number" min="0" max="100" step="0.5" placeholder="10" /></div>
                  <div class="field col-4"><div class="info-card">Commission applies to travel agents and referral partners. Override per corporate account.</div></div>
                  <div class="field col-12"><label>B2B terms &amp; conditions (shown to corporate accounts)</label><textarea id="bsB2bTermsText" data-editor="modal" placeholder="Corporate accounts are subject to the following terms and conditions..."></textarea></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-privacyGdpr" data-group-anchor="privacyGdpr" data-business-pane="privacyGdpr">
                <div class="settings-group-head">
                  <div>
                    <h3>4. Privacy policy &amp; GDPR</h3>
                    <p>Privacy policy content, GDPR consent, cookie policy and data retention settings required for EU compliance.</p>
                  </div>
                  <div class="settings-group-badge">Privacy / GDPR</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Privacy &amp; consent</label></div>
                  <div class="field col-4 switch"><input id="bsGdprConsentRequired" type="checkbox" /><label for="bsGdprConsentRequired">Require GDPR consent at booking</label></div>
                  <div class="field col-4 switch"><input id="bsCookieConsentEnabled" type="checkbox" /><label for="bsCookieConsentEnabled">Enable cookie consent banner</label></div>
                  <div class="field col-4"><label>DPO contact email</label><input id="bsDpoEmail" placeholder="dpo@diamondrentacar.gr" /></div>
                  <div class="field col-3"><label>Data retention (days)</label><input id="bsDataRetentionDays" type="number" min="30" step="1" placeholder="730" /></div>
                  <div class="field col-3"><label>Consent version</label><input id="bsPrivacyConsentVersion" placeholder="v1.0" /></div>
                  <div class="field col-6"><div class="info-card">Under GDPR, customers have the right to access, correct, or erase their personal data. Ensure your privacy policy reflects actual data processing activities.</div></div>
                  <div class="field col-12"><label class="field-sub-header">Privacy policy content</label></div>
                  <div class="field col-6"><label>Privacy policy title</label><input id="bsPrivacyPolicyTitle" placeholder="Privacy Policy — Diamond Rent A Car" /></div>
                  <div class="field col-6"><label>Cookie policy note</label><input id="bsCookiePolicyNote" placeholder="We use cookies to improve your experience. See our cookie policy." /></div>
                  <div class="field col-12"><label>Privacy policy body</label><textarea id="bsPrivacyPolicyBody" data-editor="modal" placeholder="We collect and process your personal data for the purpose of managing your car rental reservation..."></textarea></div>
                  <div class="field col-12"><label>Marketing consent text (shown at checkout)</label><textarea id="bsMarketingConsentText" placeholder="I agree to receive promotional emails and special offers from Diamond Rent A Car."></textarea></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


<section class="section" data-section="fleetCategories">'''

assert PANE_INSERT_MARKER in content, f"ERROR: pane insertion marker not found. Searched for:\\n{repr(PANE_INSERT_MARKER[:120])}"
content = content.replace(PANE_INSERT_MARKER, NEW_PANES_HTML, 1)
print("✓ 4. Inserted 6 new HTML panes")

# ============================================================
# 5. Update setBusinessForm() - add loading of new fields
# ============================================================
OLD_SET_FORM_END = '''      const bsBookingPageDescription = document.getElementById('bsBookingPageDescription');
      if (bsBookingPageDescription) bsBookingPageDescription.value = s.bookingPageDescription || '';

      document.querySelectorAll('textarea[data-editor="modal"]').forEach(syncRichPreview);'''

NEW_SET_FORM_END = '''      const bsBookingPageDescription = document.getElementById('bsBookingPageDescription');
      if (bsBookingPageDescription) bsBookingPageDescription.value = s.bookingPageDescription || '';

      // Social & contact links
      const socialFieldMap = {bsFacebookUrl:'facebookUrl',bsInstagramUrl:'instagramUrl',bsTiktokUrl:'tiktokUrl',bsTwitterUrl:'twitterUrl',bsLinkedinUrl:'linkedinUrl',bsYoutubeUrl:'youtubeUrl',bsWhatsappNumber:'whatsappNumber',bsWhatsappTemplate:'whatsappTemplate',bsGoogleMapsUrl:'googleMapsUrl',bsBookingPlatformUrl:'bookingPlatformUrl',bsReviewUrl:'reviewUrl',bsWebsiteUrl:'websiteUrl'};
      Object.entries(socialFieldMap).forEach(([id, key]) => { const el = document.getElementById(id); if(el) el.value = s[key] || ''; });

      // Additional driver
      const elADToggle = document.getElementById('bsAllowAdditionalDrivers'); if(elADToggle) elADToggle.checked = !!s.allowAdditionalDrivers;
      const elADMax = document.getElementById('bsMaxAdditionalDrivers'); if(elADMax) elADMax.value = s.maxAdditionalDrivers ?? 2;
      const elADFT = document.getElementById('bsAdditionalDriverFeeType'); if(elADFT) elADFT.value = s.additionalDriverFeeType || 'free';
      const elADFA = document.getElementById('bsAdditionalDriverFeeAmount'); if(elADFA) elADFA.value = s.additionalDriverFeeAmount ?? 0;
      const elADAge = document.getElementById('bsAdditionalDriverMinAge'); if(elADAge) elADAge.value = s.additionalDriverMinAge ?? 21;
      const elADLic = document.getElementById('bsAdditionalDriverLicenseYears'); if(elADLic) elADLic.value = s.additionalDriverLicenseYears ?? 1;
      const elADRL = document.getElementById('bsAdditionalDriverRequireLicense'); if(elADRL) elADRL.checked = !!s.additionalDriverRequireLicense;
      const elADIntl = document.getElementById('bsAdditionalDriverAllowInternational'); if(elADIntl) elADIntl.checked = !!s.additionalDriverAllowInternational;

      // Mileage & km policy
      const elMileT = document.getElementById('bsMileageType'); if(elMileT) elMileT.value = s.mileageType || 'unlimited';
      const elInclKm = document.getElementById('bsIncludedKmPerDay'); if(elInclKm) elInclKm.value = s.includedKmPerDay ?? 200;
      const elExKm = document.getElementById('bsExtraKmRate'); if(elExKm) elExKm.value = s.extraKmRate ?? 0.15;
      const elGrace = document.getElementById('bsLateReturnGraceMins'); if(elGrace) elGrace.value = s.lateReturnGraceMins ?? 30;
      const elLateFT = document.getElementById('bsLateReturnFeeType'); if(elLateFT) elLateFT.value = s.lateReturnFeeType || 'none';
      const elLateFA = document.getElementById('bsLateReturnFeeAmount'); if(elLateFA) elLateFA.value = s.lateReturnFeeAmount ?? 0;
      const elOWToggle = document.getElementById('bsAllowOneWayRental'); if(elOWToggle) elOWToggle.checked = !!s.allowOneWayRental;
      const elOWFT = document.getElementById('bsOneWayFeeType'); if(elOWFT) elOWFT.value = s.oneWayFeeType || 'free';
      const elOWFA = document.getElementById('bsOneWayFeeAmount'); if(elOWFA) elOWFA.value = s.oneWayFeeAmount ?? 0;

      // Damage excess & coverage
      const elDefEx = document.getElementById('bsDefaultDamageExcess'); if(elDefEx) elDefEx.value = s.defaultDamageExcess ?? 1500;
      const elThEx = document.getElementById('bsTheftExcess'); if(elThEx) elThEx.value = s.theftExcess ?? 3000;
      const elCdwI = document.getElementById('bsCdwIncluded'); if(elCdwI) elCdwI.checked = !!s.cdwIncluded;
      const elCdwE = document.getElementById('bsCdwReducedExcess'); if(elCdwE) elCdwE.value = s.cdwReducedExcess ?? 500;
      const elCdwR = document.getElementById('bsCdwDailyRate'); if(elCdwR) elCdwR.value = s.cdwDailyRate ?? 8;
      const elScI = document.getElementById('bsScdwIncluded'); if(elScI) elScI.checked = !!s.scdwIncluded;
      const elScE = document.getElementById('bsScdwReducedExcess'); if(elScE) elScE.value = s.scdwReducedExcess ?? 0;
      const elScR = document.getElementById('bsScdwDailyRate'); if(elScR) elScR.value = s.scdwDailyRate ?? 14;
      const elThPA = document.getElementById('bsTheftProtectionAvailable'); if(elThPA) elThPA.checked = !!s.theftProtectionAvailable;
      const elThPR = document.getElementById('bsTheftProtectionDailyRate'); if(elThPR) elThPR.value = s.theftProtectionDailyRate ?? 5;
      const elGlA = document.getElementById('bsGlassTireRoofAvailable'); if(elGlA) elGlA.checked = !!s.glassTireRoofAvailable;
      const elGlR = document.getElementById('bsGlassTireRoofDailyRate'); if(elGlR) elGlR.value = s.glassTireRoofDailyRate ?? 3;
      const elDmN = document.getElementById('bsDamageExcessNote'); if(elDmN) elDmN.value = s.damageExcessNote || '';

      // Corporate & B2B
      const elCorpE = document.getElementById('bsEnableCorporateAccounts'); if(elCorpE) elCorpE.checked = !!s.enableCorporateAccounts;
      const elB2bI = document.getElementById('bsEnableB2BInvoicing'); if(elB2bI) elB2bI.checked = !!s.enableB2BInvoicing;
      const elB2bM = document.getElementById('bsB2bContactEmail'); if(elB2bM) elB2bM.value = s.b2bContactEmail || '';
      const elCDT = document.getElementById('bsCorporateDiscountType'); if(elCDT) elCDT.value = s.corporateDiscountType || 'none';
      const elCDP = document.getElementById('bsCorporateDiscountPercentage'); if(elCDP) elCDP.value = s.corporateDiscountPercentage ?? 0;
      const elCDD = document.getElementById('bsCorporateDiscountPerDay'); if(elCDD) elCDD.value = s.corporateDiscountPerDay ?? 0;
      const elAgE = document.getElementById('bsEnableAgentCommission'); if(elAgE) elAgE.checked = !!s.enableAgentCommission;
      const elAgP = document.getElementById('bsAgentCommissionPercentage'); if(elAgP) elAgP.value = s.agentCommissionPercentage ?? 10;
      const elB2bT = document.getElementById('bsB2bTermsText'); if(elB2bT) elB2bT.value = s.b2bTermsText || '';

      // Privacy & GDPR
      const elGdpr = document.getElementById('bsGdprConsentRequired'); if(elGdpr) elGdpr.checked = !!s.gdprConsentRequired;
      const elCkE = document.getElementById('bsCookieConsentEnabled'); if(elCkE) elCkE.checked = !!s.cookieConsentEnabled;
      const elDpo = document.getElementById('bsDpoEmail'); if(elDpo) elDpo.value = s.dpoEmail || '';
      const elRet = document.getElementById('bsDataRetentionDays'); if(elRet) elRet.value = s.dataRetentionDays ?? 730;
      const elPVer = document.getElementById('bsPrivacyConsentVersion'); if(elPVer) elPVer.value = s.privacyConsentVersion || 'v1.0';
      const elPTit = document.getElementById('bsPrivacyPolicyTitle'); if(elPTit) elPTit.value = s.privacyPolicyTitle || '';
      const elCkN = document.getElementById('bsCookiePolicyNote'); if(elCkN) elCkN.value = s.cookiePolicyNote || '';
      const elPBod = document.getElementById('bsPrivacyPolicyBody'); if(elPBod) elPBod.value = s.privacyPolicyBody || '';
      const elMktC = document.getElementById('bsMarketingConsentText'); if(elMktC) elMktC.value = s.marketingConsentText || '';

      document.querySelectorAll('textarea[data-editor="modal"]').forEach(syncRichPreview);'''

assert OLD_SET_FORM_END in content, "ERROR: setBusinessForm end not found"
content = content.replace(OLD_SET_FORM_END, NEW_SET_FORM_END, 1)
print("✓ 5. Updated setBusinessForm()")

# ============================================================
# 6. Update businessPayload() - add new fields to payload
# ============================================================
OLD_PAYLOAD_END = '''        // SEO & pages
        ogSiteName: document.getElementById('bsOgSiteName')?.value.trim() || '',
        ogImageUrl: document.getElementById('bsOgImageUrl')?.value.trim() || '',
        googleAnalyticsId: document.getElementById('bsGoogleAnalyticsId')?.value.trim() || '',
        googleTagManagerId: document.getElementById('bsGoogleTagManagerId')?.value.trim() || '',
        homePageTitle: document.getElementById('bsHomePageTitle')?.value.trim() || '',
        homePageDescription: document.getElementById('bsHomePageDescription')?.value.trim() || '',
        vehiclesPageTitle: document.getElementById('bsVehiclesPageTitle')?.value.trim() || '',
        vehiclesPageDescription: document.getElementById('bsVehiclesPageDescription')?.value.trim() || '',
        bookingPageTitle: document.getElementById('bsBookingPageTitle')?.value.trim() || '',
        bookingPageDescription: document.getElementById('bsBookingPageDescription')?.value.trim() || ''
      };'''

NEW_PAYLOAD_END = '''        // SEO & pages
        ogSiteName: document.getElementById('bsOgSiteName')?.value.trim() || '',
        ogImageUrl: document.getElementById('bsOgImageUrl')?.value.trim() || '',
        googleAnalyticsId: document.getElementById('bsGoogleAnalyticsId')?.value.trim() || '',
        googleTagManagerId: document.getElementById('bsGoogleTagManagerId')?.value.trim() || '',
        homePageTitle: document.getElementById('bsHomePageTitle')?.value.trim() || '',
        homePageDescription: document.getElementById('bsHomePageDescription')?.value.trim() || '',
        vehiclesPageTitle: document.getElementById('bsVehiclesPageTitle')?.value.trim() || '',
        vehiclesPageDescription: document.getElementById('bsVehiclesPageDescription')?.value.trim() || '',
        bookingPageTitle: document.getElementById('bsBookingPageTitle')?.value.trim() || '',
        bookingPageDescription: document.getElementById('bsBookingPageDescription')?.value.trim() || '',

        // Social & contact links
        facebookUrl: document.getElementById('bsFacebookUrl')?.value.trim() || '',
        instagramUrl: document.getElementById('bsInstagramUrl')?.value.trim() || '',
        tiktokUrl: document.getElementById('bsTiktokUrl')?.value.trim() || '',
        twitterUrl: document.getElementById('bsTwitterUrl')?.value.trim() || '',
        linkedinUrl: document.getElementById('bsLinkedinUrl')?.value.trim() || '',
        youtubeUrl: document.getElementById('bsYoutubeUrl')?.value.trim() || '',
        whatsappNumber: document.getElementById('bsWhatsappNumber')?.value.trim() || '',
        whatsappTemplate: document.getElementById('bsWhatsappTemplate')?.value.trim() || '',
        googleMapsUrl: document.getElementById('bsGoogleMapsUrl')?.value.trim() || '',
        bookingPlatformUrl: document.getElementById('bsBookingPlatformUrl')?.value.trim() || '',
        reviewUrl: document.getElementById('bsReviewUrl')?.value.trim() || '',
        websiteUrl: document.getElementById('bsWebsiteUrl')?.value.trim() || '',

        // Additional driver
        allowAdditionalDrivers: !!document.getElementById('bsAllowAdditionalDrivers')?.checked,
        maxAdditionalDrivers: Number(document.getElementById('bsMaxAdditionalDrivers')?.value ?? 2),
        additionalDriverFeeType: document.getElementById('bsAdditionalDriverFeeType')?.value || 'free',
        additionalDriverFeeAmount: Number(document.getElementById('bsAdditionalDriverFeeAmount')?.value ?? 0),
        additionalDriverMinAge: Number(document.getElementById('bsAdditionalDriverMinAge')?.value ?? 21),
        additionalDriverLicenseYears: Number(document.getElementById('bsAdditionalDriverLicenseYears')?.value ?? 1),
        additionalDriverRequireLicense: !!document.getElementById('bsAdditionalDriverRequireLicense')?.checked,
        additionalDriverAllowInternational: !!document.getElementById('bsAdditionalDriverAllowInternational')?.checked,

        // Mileage & km policy
        mileageType: document.getElementById('bsMileageType')?.value || 'unlimited',
        includedKmPerDay: Number(document.getElementById('bsIncludedKmPerDay')?.value ?? 200),
        extraKmRate: Number(document.getElementById('bsExtraKmRate')?.value ?? 0.15),
        lateReturnGraceMins: Number(document.getElementById('bsLateReturnGraceMins')?.value ?? 30),
        lateReturnFeeType: document.getElementById('bsLateReturnFeeType')?.value || 'none',
        lateReturnFeeAmount: Number(document.getElementById('bsLateReturnFeeAmount')?.value ?? 0),
        allowOneWayRental: !!document.getElementById('bsAllowOneWayRental')?.checked,
        oneWayFeeType: document.getElementById('bsOneWayFeeType')?.value || 'free',
        oneWayFeeAmount: Number(document.getElementById('bsOneWayFeeAmount')?.value ?? 0),

        // Damage excess & coverage
        defaultDamageExcess: Number(document.getElementById('bsDefaultDamageExcess')?.value ?? 1500),
        theftExcess: Number(document.getElementById('bsTheftExcess')?.value ?? 3000),
        cdwIncluded: !!document.getElementById('bsCdwIncluded')?.checked,
        cdwReducedExcess: Number(document.getElementById('bsCdwReducedExcess')?.value ?? 500),
        cdwDailyRate: Number(document.getElementById('bsCdwDailyRate')?.value ?? 8),
        scdwIncluded: !!document.getElementById('bsScdwIncluded')?.checked,
        scdwReducedExcess: Number(document.getElementById('bsScdwReducedExcess')?.value ?? 0),
        scdwDailyRate: Number(document.getElementById('bsScdwDailyRate')?.value ?? 14),
        theftProtectionAvailable: !!document.getElementById('bsTheftProtectionAvailable')?.checked,
        theftProtectionDailyRate: Number(document.getElementById('bsTheftProtectionDailyRate')?.value ?? 5),
        glassTireRoofAvailable: !!document.getElementById('bsGlassTireRoofAvailable')?.checked,
        glassTireRoofDailyRate: Number(document.getElementById('bsGlassTireRoofDailyRate')?.value ?? 3),
        damageExcessNote: document.getElementById('bsDamageExcessNote')?.value.trim() || '',

        // Corporate & B2B
        enableCorporateAccounts: !!document.getElementById('bsEnableCorporateAccounts')?.checked,
        enableB2BInvoicing: !!document.getElementById('bsEnableB2BInvoicing')?.checked,
        b2bContactEmail: document.getElementById('bsB2bContactEmail')?.value.trim() || '',
        corporateDiscountType: document.getElementById('bsCorporateDiscountType')?.value || 'none',
        corporateDiscountPercentage: Number(document.getElementById('bsCorporateDiscountPercentage')?.value ?? 0),
        corporateDiscountPerDay: Number(document.getElementById('bsCorporateDiscountPerDay')?.value ?? 0),
        enableAgentCommission: !!document.getElementById('bsEnableAgentCommission')?.checked,
        agentCommissionPercentage: Number(document.getElementById('bsAgentCommissionPercentage')?.value ?? 10),
        b2bTermsText: document.getElementById('bsB2bTermsText')?.value.trim() || '',

        // Privacy & GDPR
        gdprConsentRequired: !!document.getElementById('bsGdprConsentRequired')?.checked,
        cookieConsentEnabled: !!document.getElementById('bsCookieConsentEnabled')?.checked,
        dpoEmail: document.getElementById('bsDpoEmail')?.value.trim() || '',
        dataRetentionDays: Number(document.getElementById('bsDataRetentionDays')?.value ?? 730),
        privacyConsentVersion: document.getElementById('bsPrivacyConsentVersion')?.value.trim() || 'v1.0',
        privacyPolicyTitle: document.getElementById('bsPrivacyPolicyTitle')?.value.trim() || '',
        cookiePolicyNote: document.getElementById('bsCookiePolicyNote')?.value.trim() || '',
        privacyPolicyBody: document.getElementById('bsPrivacyPolicyBody')?.value.trim() || '',
        marketingConsentText: document.getElementById('bsMarketingConsentText')?.value.trim() || ''
      };'''

assert OLD_PAYLOAD_END in content, "ERROR: businessPayload end not found"
content = content.replace(OLD_PAYLOAD_END, NEW_PAYLOAD_END, 1)
print("✓ 6. Updated businessPayload()")

# ============================================================
# Write back
# ============================================================
with open(FILE, 'w') as f:
    f.write(content)

new_len = len(content)
print(f"\nDone! File size: {original_len:,} → {new_len:,} bytes (+{new_len - original_len:,})")
