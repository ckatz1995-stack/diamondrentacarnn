#!/usr/bin/env python3
import sys

FILE = '/home/user/diamondrentacarnn/src/public/custom-elements/pricingAdminHtml'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

original_size = len(content)
print(f"Original file size: {original_size} bytes")

changes = []

# ── CHANGE 1 ─────────────────────────────────────────────────────────────────
changes.append((
    1,
    '''            <div class="settings-command-pills">
              <span class="pill">Brand identity</span>
              <span class="pill">UI Labels</span>
              <span class="pill">SEO &amp; pages</span>
              <span class="pill">Rental terms</span>
            </div>
            <div class="settings-command-actions">
              <button class="btn" data-home-go="business" data-focus-group="frontBrand">Brand</button>
              <button class="btn" data-home-go="business" data-focus-group="uiLabels">UI Labels</button>
              <button class="btn" data-home-go="business" data-focus-group="seoPages">SEO</button>
              <button class="btn" data-home-go="business" data-focus-group="vehicleCatalog">Catalog</button>
            </div>''',
    '''            <div class="settings-command-pills">
              <span class="pill">Brand identity</span>
              <span class="pill">UI Labels</span>
              <span class="pill">Social links</span>
              <span class="pill">SEO &amp; pages</span>
            </div>
            <div class="settings-command-actions">
              <button class="btn" data-home-go="business" data-focus-group="frontBrand">Brand</button>
              <button class="btn" data-home-go="business" data-focus-group="uiLabels">UI Labels</button>
              <button class="btn" data-home-go="business" data-focus-group="socialContact">Social</button>
              <button class="btn" data-home-go="business" data-focus-group="seoPages">SEO</button>
            </div>'''
))

# ── CHANGE 2 ─────────────────────────────────────────────────────────────────
changes.append((
    2,
    '''            <div class="settings-command-pills">
              <span class="pill">Booking policies</span>
              <span class="pill">Payment</span>
              <span class="pill">Dynamic pricing</span>
              <span class="pill">Fleet</span>
            </div>
            <div class="settings-command-actions">
              <button class="btn" data-home-go="business" data-focus-group="bookingPolicies">Booking rules</button>
              <button class="btn" data-home-go="business" data-focus-group="paymentDeposit">Payment</button>
              <button class="btn" data-settings-section="dynamicPricing">Dynamic pricing</button>
              <button class="btn" data-settings-section="fleetCategories">Fleet</button>
            </div>''',
    '''            <div class="settings-command-pills">
              <span class="pill">Booking policies</span>
              <span class="pill">Payment</span>
              <span class="pill">Add. driver</span>
              <span class="pill">Dynamic pricing</span>
            </div>
            <div class="settings-command-actions">
              <button class="btn" data-home-go="business" data-focus-group="bookingPolicies">Booking rules</button>
              <button class="btn" data-home-go="business" data-focus-group="paymentDeposit">Payment</button>
              <button class="btn" data-home-go="business" data-focus-group="additionalDriver">Add. driver</button>
              <button class="btn" data-settings-section="dynamicPricing">Dynamic pricing</button>
            </div>'''
))

# ── CHANGE 3 ─────────────────────────────────────────────────────────────────
changes.append((
    3,
    "        { big: money(settings.defaultDeposit || 0, currency), small:'Default deposit' }\n      ].map(k => `<div class=\"kpi\"><b>${esc(String(k.big))}</b><span>${esc(k.small)}</span></div>`).join('');",
    "        { big: money(settings.defaultDeposit || 0, currency), small:'Default deposit' },\n        { big: effectiveStationProfiles().length, small:'Stations' },\n        { big: pickupLocationRows().filter(r => r.active !== false).length, small:'Pickup locations' },\n        { big: pricingSeasonsRows().filter(r => r.active !== false).length, small:'Pricing seasons' },\n        { big: categoryRateRuleRows().filter(r => r.active !== false).length, small:'Rate rules' },\n        { big: staffUsers().filter(u => u.active !== false).length, small:'Staff users' }\n      ].map(k => `<div class=\"kpi\"><b>${esc(String(k.big))}</b><span>${esc(k.small)}</span></div>`).join('');"
))

# ── CHANGE 4 ─────────────────────────────────────────────────────────────────
changes.append((
    4,
    """      if(kind === 'user'){
        const roleOptions = roleRows().filter(role => role.active !== false).map(role => `<option value="${esc(role.key)}" ${String(item.roleKey || '') === String(role.key) ? 'selected' : ''}>${esc(role.label)}</option>`).join('');
        return `
          <div class="field col-6"><label>Full name</label><input data-field="fullName" value="${esc(item.fullName || '')}" /></div>
          <div class="field col-6"><label>Email</label><input data-field="email" value="${esc(item.email || '')}" placeholder="name@company.com" /></div>
          <div class="field col-4"><label>Role</label><select data-field="roleKey">${roleOptions}</select></div>
          <div class="field col-4 switch"><input data-field="active" type="checkbox" ${item.active !== false ? 'checked' : ''} /><label>Active</label></div>
          <div class="field col-4"><label>Member link</label><input value="${esc(item.memberId || 'Pending / not linked yet')}" readonly /></div>
          <div class="field col-12"><label>Notes</label><textarea data-field="notes">${esc(item.notes || '')}</textarea></div>
          <div class="field col-12"><label>Guideline</label><textarea readonly>Κράτα ξεχωριστό account ανά άνθρωπο. Μην διαγράφεις λογαριασμούς που έχουν ιστορικό — κάνε deactivate για να σωθεί το audit trail.</textarea></div>`;
      }""",
    """      if(kind === 'user'){
        const roleOptions = roleRows().filter(role => role.active !== false).map(role => `<option value="${esc(role.key)}" ${String(item.roleKey || '') === String(role.key) ? 'selected' : ''}>${esc(role.label)}</option>`).join('');
        const stationOptions = ['<option value="">— Any station —</option>'].concat(effectiveStationProfiles().map(s => `<option value="${esc(s.key)}" ${String(item.stationKey || '') === String(s.key) ? 'selected' : ''}>${esc(s.label || s.key)}</option>`)).join('');
        return `
          <div class="field col-6"><label>Full name</label><input data-field="fullName" value="${esc(item.fullName || '')}" /></div>
          <div class="field col-6"><label>Email</label><input data-field="email" value="${esc(item.email || '')}" placeholder="name@company.com" /></div>
          <div class="field col-4"><label>Role</label><select data-field="roleKey">${roleOptions}</select></div>
          <div class="field col-4"><label>Job title / position</label><input data-field="jobTitle" value="${esc(item.jobTitle || '')}" placeholder="Fleet manager" /></div>
          <div class="field col-4"><label>Phone</label><input data-field="phone" value="${esc(item.phone || '')}" placeholder="+30 6900 000000" /></div>
          <div class="field col-4"><label>Assigned station</label><select data-field="stationKey">${stationOptions}</select></div>
          <div class="field col-4"><label>Start date</label><input data-field="startDate" type="date" value="${esc(item.startDate || '')}" /></div>
          <div class="field col-4 switch"><input data-field="active" type="checkbox" ${item.active !== false ? 'checked' : ''} /><label>Active</label></div>
          <div class="field col-6"><label>Emergency contact name</label><input data-field="emergencyName" value="${esc(item.emergencyName || '')}" placeholder="Contact person name" /></div>
          <div class="field col-6"><label>Emergency contact phone</label><input data-field="emergencyPhone" value="${esc(item.emergencyPhone || '')}" placeholder="+30 6900 000000" /></div>
          <div class="field col-12"><label>Member link (Wix)</label><input value="${esc(item.memberId || 'Pending / not linked yet')}" readonly /></div>
          <div class="field col-12"><label>Notes</label><textarea data-field="notes">${esc(item.notes || '')}</textarea></div>`;
      }"""
))

# ── CHANGE 5 ─────────────────────────────────────────────────────────────────
changes.append((
    5,
    "      if(kind === 'user') return { _id:'', email:'', fullName:'', roleKey:(roleRows()[0]?.key || 'viewer'), active:true, memberId:'', notes:'' };",
    "      if(kind === 'user') return { _id:'', email:'', fullName:'', roleKey:(roleRows()[0]?.key || 'viewer'), active:true, memberId:'', notes:'', jobTitle:'', phone:'', stationKey:'', startDate:'', emergencyName:'', emergencyPhone:'' };"
))

# ── CHANGE 6 ─────────────────────────────────────────────────────────────────
changes.append((
    6,
    "      { key:'privacyGdpr', area:'company', label:'4. Privacy & GDPR', shortLabel:'Privacy / GDPR', helper:'Privacy policy text, GDPR consent, cookie policy, data retention and DPO contact.' }\n    ];",
    "      { key:'privacyGdpr', area:'company', label:'4. Privacy & GDPR', shortLabel:'Privacy / GDPR', helper:'Privacy policy text, GDPR consent, cookie policy, data retention and DPO contact.' },\n      { key:'integrations', area:'company', label:'5. Integrations & APIs', shortLabel:'Integrations', helper:'Payment gateway, Google Calendar, webhook URLs and external system API configurations.' },\n      { key:'backupRestore', area:'company', label:'6. Backup & restore', shortLabel:'Backup', helper:'Export full settings snapshot to JSON, copy to clipboard and restore from a previous backup.' },\n      { key:'pricingDefaults', area:'operations', label:'5. Pricing surcharges', shortLabel:'Surcharges', helper:'Night hours, young/senior driver, airport pickup, last-minute booking surcharge rates and rules.' }\n    ];"
))

# ── CHANGE 7 ─────────────────────────────────────────────────────────────────
changes.append((
    7,
    '''              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


<section class="section" data-section="fleetCategories">''',
    '''              </div>

              <div class="settings-group business-pane" id="group-integrations" data-group-anchor="integrations" data-business-pane="integrations">
                <div class="settings-group-head">
                  <div>
                    <h3>5. Integrations &amp; APIs</h3>
                    <p>Payment gateway credentials, Google Calendar sync, outbound webhooks and external system connections.</p>
                  </div>
                  <div class="settings-group-badge">Integrations</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Payment gateway</label></div>
                  <div class="field col-4"><label>Payment gateway</label><select id="bsPaymentGateway"><option value="none">None / manual</option><option value="stripe">Stripe</option><option value="paypal">PayPal</option><option value="alpha">Alpha Bank</option><option value="piraeus">Piraeus Bank</option><option value="viva">Viva Wallet</option></select></div>
                  <div class="field col-4"><label>Stripe publishable key</label><input id="bsStripePublishableKey" placeholder="pk_live_..." /></div>
                  <div class="field col-4"><label>Stripe webhook secret</label><input id="bsStripeWebhookSecret" type="password" placeholder="whsec_..." /></div>
                  <div class="field col-4"><label>PayPal client ID</label><input id="bsPaypalClientId" placeholder="AXxx..." /></div>
                  <div class="field col-4"><label>Payment test mode</label><select id="bsPaymentTestMode"><option value="live">Live</option><option value="test">Test / sandbox</option></select></div>
                  <div class="field col-4"><div class="info-card">Never share secret keys. Store them in Wix Secrets Manager and reference via backend — these fields are for display reference only.</div></div>

                  <div class="field col-12"><label class="field-sub-header">Google Calendar integration</label></div>
                  <div class="field col-3 switch"><input id="bsGoogleCalendarEnabled" type="checkbox" /><label for="bsGoogleCalendarEnabled">Enable Google Calendar sync</label></div>
                  <div class="field col-5"><label>Calendar ID</label><input id="bsGoogleCalendarId" placeholder="yourcompany@group.calendar.google.com" /></div>
                  <div class="field col-4"><label>Sync mode</label><select id="bsGoogleCalendarSyncMode"><option value="bookings">Confirmed bookings</option><option value="rentals">Active rentals</option><option value="both">Bookings + rentals</option></select></div>

                  <div class="field col-12"><label class="field-sub-header">Outbound webhook</label></div>
                  <div class="field col-3 switch"><input id="bsWebhookEnabled" type="checkbox" /><label for="bsWebhookEnabled">Enable outbound webhook</label></div>
                  <div class="field col-5"><label>Webhook URL</label><input id="bsWebhookUrl" placeholder="https://hooks.zapier.com/..." /></div>
                  <div class="field col-4"><label>Webhook secret header</label><input id="bsWebhookSecret" type="password" placeholder="X-Secret-Key value" /></div>
                  <div class="field col-12"><label>Events to send (comma-separated)</label><input id="bsWebhookEvents" placeholder="booking.confirmed, booking.cancelled, rental.started, rental.completed" /></div>

                  <div class="field col-12"><label class="field-sub-header">External booking platform</label></div>
                  <div class="field col-4 switch"><input id="bsOtaSyncEnabled" type="checkbox" /><label for="bsOtaSyncEnabled">OTA channel sync enabled</label></div>
                  <div class="field col-4"><label>OTA provider</label><select id="bsOtaProvider"><option value="none">None</option><option value="booking">Booking.com</option><option value="rentalcars">RentalCars.com</option><option value="cartrawler">CarTrawler</option><option value="custom">Custom API</option></select></div>
                  <div class="field col-4"><label>OTA property / fleet ID</label><input id="bsOtaPropertyId" placeholder="PROP-12345" /></div>
                  <div class="field col-12"><label>OTA API key / token</label><input id="bsOtaApiKey" type="password" placeholder="OTA API key or access token" /></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-pricingDefaults" data-group-anchor="pricingDefaults" data-business-pane="pricingDefaults">
                <div class="settings-group-head">
                  <div>
                    <h3>5. Pricing surcharges &amp; defaults</h3>
                    <p>Extra charges applied automatically based on driver age, pickup time, location or booking window. These overlay the base rate rules.</p>
                  </div>
                  <div class="settings-group-badge">Surcharges</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Night hours surcharge</label></div>
                  <div class="field col-4"><label>Night surcharge type</label><select id="bsNightSurchargeType"><option value="none">No surcharge</option><option value="percentage">Percentage on top</option><option value="fixed">Fixed per rental</option></select></div>
                  <div class="field col-4"><label>Night surcharge amount / %</label><input id="bsNightSurchargeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-4"><div class="info-card">Applied when pickup or dropoff falls within the night window defined in Operations.</div></div>

                  <div class="field col-12"><label class="field-sub-header">Young driver surcharge</label></div>
                  <div class="field col-4"><label>Young driver surcharge type</label><select id="bsYoungDriverSurchargeType"><option value="none">No surcharge</option><option value="per-day">Fixed per day</option><option value="percentage">Percentage on total</option><option value="fixed">Fixed per rental</option></select></div>
                  <div class="field col-4"><label>Young driver amount / %</label><input id="bsYoungDriverSurchargeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-4"><div class="info-card">Applied when main driver age ≤ young driver threshold set in Booking policies.</div></div>

                  <div class="field col-12"><label class="field-sub-header">Senior driver surcharge</label></div>
                  <div class="field col-4"><label>Senior driver surcharge type</label><select id="bsSeniorDriverSurchargeType"><option value="none">No surcharge</option><option value="per-day">Fixed per day</option><option value="percentage">Percentage on total</option><option value="fixed">Fixed per rental</option></select></div>
                  <div class="field col-4"><label>Senior driver amount / %</label><input id="bsSeniorDriverSurchargeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-4"><div class="info-card">Applied when main driver age ≥ senior driver threshold set in Booking policies.</div></div>

                  <div class="field col-12"><label class="field-sub-header">Airport / zone pickup surcharge</label></div>
                  <div class="field col-4"><label>Airport surcharge type</label><select id="bsAirportSurchargeType"><option value="none">No surcharge</option><option value="fixed">Fixed per rental</option><option value="percentage">Percentage on total</option></select></div>
                  <div class="field col-4"><label>Airport surcharge amount / %</label><input id="bsAirportSurchargeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-4"><label>Airport location keys (comma-separated)</label><input id="bsAirportLocationKeys" placeholder="thessaloniki_airport, kavala_airport" /></div>

                  <div class="field col-12"><label class="field-sub-header">Last-minute booking surcharge</label></div>
                  <div class="field col-3 switch"><input id="bsLastMinuteSurchargeEnabled" type="checkbox" /><label for="bsLastMinuteSurchargeEnabled">Enable last-minute surcharge</label></div>
                  <div class="field col-3"><label>Threshold (hours before pickup)</label><input id="bsLastMinuteThresholdHours" type="number" min="1" step="1" placeholder="6" /></div>
                  <div class="field col-3"><label>Surcharge type</label><select id="bsLastMinuteSurchargeType"><option value="percentage">Percentage on total</option><option value="fixed">Fixed per rental</option></select></div>
                  <div class="field col-3"><label>Surcharge amount / %</label><input id="bsLastMinuteSurchargeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>

                  <div class="field col-12"><label class="field-sub-header">Cross-border / international surcharge</label></div>
                  <div class="field col-4 switch"><input id="bsCrossBorderSurchargeEnabled" type="checkbox" /><label for="bsCrossBorderSurchargeEnabled">Enable cross-border surcharge</label></div>
                  <div class="field col-4"><label>Surcharge amount (fixed)</label><input id="bsCrossBorderSurchargeAmount" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                  <div class="field col-4"><label>Allowed countries (comma-separated ISO codes)</label><input id="bsAllowedCrossBorderCountries" placeholder="AL, MK, BG, TR" /></div>
                </div>
              </div>

              <div class="settings-group business-pane" id="group-backupRestore" data-group-anchor="backupRestore" data-business-pane="backupRestore">
                <div class="settings-group-head">
                  <div>
                    <h3>6. Backup &amp; restore</h3>
                    <p>Export the full settings and pricing snapshot to JSON. Import a previous backup to restore all settings at once.</p>
                  </div>
                  <div class="settings-group-badge">Backup</div>
                </div>
                <div class="settings-grid">
                  <div class="field col-12"><label class="field-sub-header">Export</label></div>
                  <div class="field col-12">
                    <div class="info-card">The export includes all business settings, pricing seasons, rate rules, insurance plans, extra services, fee rules, vehicle categories and fleet vehicles. Staff users and roles are excluded for security.</div>
                  </div>
                  <div class="field col-12">
                    <div class="settings-command-actions" style="margin:0">
                      <button class="btn good" id="backupExportFullBtn" type="button">Export full snapshot JSON</button>
                      <button class="btn" id="backupCopyClipboardBtn" type="button">Copy to clipboard</button>
                      <button class="btn" id="backupExportSettingsOnlyBtn" type="button">Export business settings only</button>
                    </div>
                  </div>
                  <div class="field col-12"><label class="field-sub-header">Restore from backup</label></div>
                  <div class="field col-12">
                    <div class="info-card" style="background:rgba(220,38,38,.06);border-color:rgba(220,38,38,.18);color:#7f1d1d">Warning: importing a backup will overwrite all business settings, pricing rules, categories and fleet data. This action cannot be undone. Make sure to export a fresh backup first.</div>
                  </div>
                  <div class="field col-12"><label>Paste backup JSON here</label><textarea id="backupImportJson" style="font-family:monospace;font-size:12px;height:140px" placeholder=\'{"businessSettings":{...},"vehicleCategories":[...],...}\'></textarea></div>
                  <div class="field col-12">
                    <div class="settings-command-actions" style="margin:0">
                      <button class="btn" id="backupValidateBtn" type="button">Validate JSON</button>
                      <button class="btn danger" id="backupImportBtn" type="button">Import &amp; restore</button>
                    </div>
                    <div id="backupValidationResult" style="margin-top:10px;font-size:13px;color:var(--muted)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


<section class="section" data-section="fleetCategories">'''
))

# ── CHANGE 8 ─────────────────────────────────────────────────────────────────
changes.append((
    8,
    "      const elRevDays = document.getElementById('bsEmailReviewRequestDays'); if(elRevDays) elRevDays.value = s.emailReviewRequestDays ?? 2;\n\n      document.querySelectorAll('textarea[data-editor=modal]').forEach(syncRichPreview);\n      renderVehicleCatalogPreview();\n      if(state.activeSection === 'business') renderBusinessPaneNav();",
    "      const elRevDays = document.getElementById('bsEmailReviewRequestDays'); if(elRevDays) elRevDays.value = s.emailReviewRequestDays ?? 2;\n\n      // Integrations & APIs\n      const intFieldMap = {bsPaymentGateway:'paymentGateway',bsStripePublishableKey:'stripePublishableKey',bsStripeWebhookSecret:'stripeWebhookSecret',bsPaypalClientId:'paypalClientId',bsPaymentTestMode:'paymentTestMode',bsGoogleCalendarId:'googleCalendarId',bsGoogleCalendarSyncMode:'googleCalendarSyncMode',bsWebhookUrl:'webhookUrl',bsWebhookSecret:'webhookSecret',bsWebhookEvents:'webhookEvents',bsOtaProvider:'otaProvider',bsOtaPropertyId:'otaPropertyId',bsOtaApiKey:'otaApiKey'};\n      Object.entries(intFieldMap).forEach(([id, key]) => { const el = document.getElementById(id); if(el) el.value = s[key] || ''; });\n      const elGCal = document.getElementById('bsGoogleCalendarEnabled'); if(elGCal) elGCal.checked = !!s.googleCalendarEnabled;\n      const elWHook = document.getElementById('bsWebhookEnabled'); if(elWHook) elWHook.checked = !!s.webhookEnabled;\n      const elOTA = document.getElementById('bsOtaSyncEnabled'); if(elOTA) elOTA.checked = !!s.otaSyncEnabled;\n\n      // Pricing surcharges\n      const surchargeTextFields = {bsNightSurchargeType:'nightSurchargeType',bsNightSurchargeAmount:'nightSurchargeAmount',bsYoungDriverSurchargeType:'youngDriverSurchargeType',bsYoungDriverSurchargeAmount:'youngDriverSurchargeAmount',bsSeniorDriverSurchargeType:'seniorDriverSurchargeType',bsSeniorDriverSurchargeAmount:'seniorDriverSurchargeAmount',bsAirportSurchargeType:'airportSurchargeType',bsAirportSurchargeAmount:'airportSurchargeAmount',bsAirportLocationKeys:'airportLocationKeys',bsLastMinuteThresholdHours:'lastMinuteThresholdHours',bsLastMinuteSurchargeType:'lastMinuteSurchargeType',bsLastMinuteSurchargeAmount:'lastMinuteSurchargeAmount',bsCrossBorderSurchargeAmount:'crossBorderSurchargeAmount',bsAllowedCrossBorderCountries:'allowedCrossBorderCountries'};\n      Object.entries(surchargeTextFields).forEach(([id, key]) => { const el = document.getElementById(id); if(el) el.value = s[key] ?? ''; });\n      const elLMEn = document.getElementById('bsLastMinuteSurchargeEnabled'); if(elLMEn) elLMEn.checked = !!s.lastMinuteSurchargeEnabled;\n      const elCBEn = document.getElementById('bsCrossBorderSurchargeEnabled'); if(elCBEn) elCBEn.checked = !!s.crossBorderSurchargeEnabled;\n\n      document.querySelectorAll('textarea[data-editor=modal]').forEach(syncRichPreview);\n      renderVehicleCatalogPreview();\n      if(state.activeSection === 'business') renderBusinessPaneNav();"
))

# ── CHANGE 9 ─────────────────────────────────────────────────────────────────
changes.append((
    9,
    "        emailReviewRequestBodyNote: document.getElementById('bsEmailReviewRequestBodyNote')?.value.trim() || ''\n      };",
    """        emailReviewRequestBodyNote: document.getElementById('bsEmailReviewRequestBodyNote')?.value.trim() || '',

        // Integrations & APIs
        paymentGateway: document.getElementById('bsPaymentGateway')?.value || 'none',
        stripePublishableKey: document.getElementById('bsStripePublishableKey')?.value.trim() || '',
        stripeWebhookSecret: document.getElementById('bsStripeWebhookSecret')?.value.trim() || '',
        paypalClientId: document.getElementById('bsPaypalClientId')?.value.trim() || '',
        paymentTestMode: document.getElementById('bsPaymentTestMode')?.value || 'live',
        googleCalendarEnabled: !!document.getElementById('bsGoogleCalendarEnabled')?.checked,
        googleCalendarId: document.getElementById('bsGoogleCalendarId')?.value.trim() || '',
        googleCalendarSyncMode: document.getElementById('bsGoogleCalendarSyncMode')?.value || 'bookings',
        webhookEnabled: !!document.getElementById('bsWebhookEnabled')?.checked,
        webhookUrl: document.getElementById('bsWebhookUrl')?.value.trim() || '',
        webhookSecret: document.getElementById('bsWebhookSecret')?.value.trim() || '',
        webhookEvents: document.getElementById('bsWebhookEvents')?.value.trim() || '',
        otaSyncEnabled: !!document.getElementById('bsOtaSyncEnabled')?.checked,
        otaProvider: document.getElementById('bsOtaProvider')?.value || 'none',
        otaPropertyId: document.getElementById('bsOtaPropertyId')?.value.trim() || '',
        otaApiKey: document.getElementById('bsOtaApiKey')?.value.trim() || '',

        // Pricing surcharges
        nightSurchargeType: document.getElementById('bsNightSurchargeType')?.value || 'none',
        nightSurchargeAmount: Number(document.getElementById('bsNightSurchargeAmount')?.value ?? 0),
        youngDriverSurchargeType: document.getElementById('bsYoungDriverSurchargeType')?.value || 'none',
        youngDriverSurchargeAmount: Number(document.getElementById('bsYoungDriverSurchargeAmount')?.value ?? 0),
        seniorDriverSurchargeType: document.getElementById('bsSeniorDriverSurchargeType')?.value || 'none',
        seniorDriverSurchargeAmount: Number(document.getElementById('bsSeniorDriverSurchargeAmount')?.value ?? 0),
        airportSurchargeType: document.getElementById('bsAirportSurchargeType')?.value || 'none',
        airportSurchargeAmount: Number(document.getElementById('bsAirportSurchargeAmount')?.value ?? 0),
        airportLocationKeys: document.getElementById('bsAirportLocationKeys')?.value.trim() || '',
        lastMinuteSurchargeEnabled: !!document.getElementById('bsLastMinuteSurchargeEnabled')?.checked,
        lastMinuteThresholdHours: Number(document.getElementById('bsLastMinuteThresholdHours')?.value ?? 6),
        lastMinuteSurchargeType: document.getElementById('bsLastMinuteSurchargeType')?.value || 'percentage',
        lastMinuteSurchargeAmount: Number(document.getElementById('bsLastMinuteSurchargeAmount')?.value ?? 0),
        crossBorderSurchargeEnabled: !!document.getElementById('bsCrossBorderSurchargeEnabled')?.checked,
        crossBorderSurchargeAmount: Number(document.getElementById('bsCrossBorderSurchargeAmount')?.value ?? 0),
        allowedCrossBorderCountries: document.getElementById('bsAllowedCrossBorderCountries')?.value.trim() || ''
      };"""
))

# ── CHANGE 10 ────────────────────────────────────────────────────────────────
changes.append((
    10,
    "      els.exportSnapshotBtn.addEventListener('click', () => exportSnapshot());",
    """      els.exportSnapshotBtn.addEventListener('click', () => exportSnapshot());
      document.getElementById('backupExportFullBtn')?.addEventListener('click', () => exportSnapshot());
      document.getElementById('backupCopyClipboardBtn')?.addEventListener('click', () => copySnapshot());
      document.getElementById('backupExportSettingsOnlyBtn')?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(state.snapshot?.businessSettings || {}, null, 2)], { type:'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `business-settings-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      document.getElementById('backupValidateBtn')?.addEventListener('click', () => {
        const raw = document.getElementById('backupImportJson')?.value || '';
        const result = document.getElementById('backupValidationResult');
        if(!result) return;
        try {
          const parsed = JSON.parse(raw);
          const keys = Object.keys(parsed);
          result.style.color = 'var(--good)';
          result.textContent = `✓ Valid JSON — ${keys.length} top-level keys: ${keys.slice(0,8).join(', ')}${keys.length > 8 ? '…' : ''}`;
        } catch(e) {
          result.style.color = 'var(--danger)';
          result.textContent = `✗ Invalid JSON: ${e.message}`;
        }
      });
      document.getElementById('backupImportBtn')?.addEventListener('click', () => {
        const raw = document.getElementById('backupImportJson')?.value || '';
        const result = document.getElementById('backupValidationResult');
        try {
          const parsed = JSON.parse(raw);
          if(!confirm('Import this backup? All current settings, pricing, categories and fleet data will be overwritten.')) return;
          setBusy(true);
          post('importSnapshot', { payload: parsed });
        } catch(e) {
          if(result){ result.style.color='var(--danger)'; result.textContent=`✗ Cannot import: ${e.message}`; }
        }
      });"""
))

# ── Apply all changes ────────────────────────────────────────────────────────
for (step, old, new) in changes:
    count = content.count(old)
    if count == 0:
        print(f"\nFAILED at CHANGE {step}: string not found in file.")
        print(f"First 200 chars of search string:\n{repr(old[:200])}")
        sys.exit(1)
    if count > 1:
        print(f"WARNING at CHANGE {step}: found {count} occurrences — replacing first only.")
    content = content.replace(old, new, 1)
    print(f"CHANGE {step}: OK (was found {count}x)")

# ── Write back ───────────────────────────────────────────────────────────────
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

new_size = len(content)
print(f"\nAll 10 changes applied successfully.")
print(f"Original size: {original_size:,} bytes")
print(f"New size:      {new_size:,} bytes")
print(f"Delta:         +{new_size - original_size:,} bytes")
