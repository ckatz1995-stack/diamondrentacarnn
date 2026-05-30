import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPricingSnapshot } from '../src/backend/pricingSnapshot.js';

function baseCatalog(overrides = {}) {
  return {
    businessSettings: {
      _id: 'bs-1',
      currency: 'EUR',
      vatRateDecimal: 0.24,
      updatedAt: '2024-01-01T00:00:00Z',
      ...overrides.businessSettings
    },
    insurancePlans: [
      { key: 'cdw', label: 'CDW', pricePerDay: 0, _id: 'ins-cdw' },
      { key: 'scdw', label: 'SCDW', pricePerDay: 12, _id: 'ins-scdw' }
    ],
    extraServices: [
      { key: 'baby', label: 'Βρεφικό κάθισμα', price: 5, billingMode: 'perDay', _id: 'ex-baby' },
      { key: 'gps',  label: 'GPS', price: 8, billingMode: 'perDay', _id: 'ex-gps' }
    ],
    ...overrides
  };
}

describe('buildPricingSnapshot — schema version', () => {
  it('returns schemaVersion 2', () => {
    const snap = buildPricingSnapshot({ catalog: baseCatalog(), booking: { billableDays: 1 } });
    assert.equal(snap.schemaVersion, 2);
  });
});

describe('buildPricingSnapshot — basic fields', () => {
  it('captures currency and vatRate from businessSettings', () => {
    const snap = buildPricingSnapshot({ catalog: baseCatalog(), booking: { billableDays: 2 } });
    assert.equal(snap.currency, 'EUR');
    assert.equal(snap.vatRate, 0.24);
  });

  it('billableDays from booking overrides default', () => {
    const snap = buildPricingSnapshot({ catalog: baseCatalog(), booking: { billableDays: 5 } });
    assert.equal(snap.billableDays, 5);
  });

  it('minimum billableDays is 1', () => {
    const snap = buildPricingSnapshot({ catalog: baseCatalog(), booking: { billableDays: 0 } });
    assert.equal(snap.billableDays, 1);
  });
});

describe('buildPricingSnapshot — insurance plan', () => {
  it('resolves CDW package from catalog', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 3 },
      selectedPackage: 'cdw'
    });
    assert.equal(snap.selectedPackage.key, 'cdw');
    assert.equal(snap.selectedPackage.label, 'CDW');
    assert.equal(snap.selectedPackage.pricePerDay, 0);
  });

  it('resolves SCDW package from catalog', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 3 },
      selectedPackage: 'scdw'
    });
    assert.equal(snap.selectedPackage.key, 'scdw');
    assert.equal(snap.selectedPackage.pricePerDay, 12);
  });

  it('warns about missing insurance plan', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 3 },
      selectedPackage: 'platinum'
    });
    assert.ok(snap.warnings.some(w => w.includes('insurance:missing:platinum')));
  });

  it('no warning for "none" or "nodw" package', () => {
    for (const pkg of ['none', 'nodw']) {
      const snap = buildPricingSnapshot({
        catalog: baseCatalog(),
        booking: { billableDays: 1 },
        selectedPackage: pkg
      });
      assert.equal(snap.warnings.filter(w => w.startsWith('insurance:missing')).length, 0);
    }
  });
});

describe('buildPricingSnapshot — extras', () => {
  it('resolves known extras from catalog', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 3 },
      selectedExtrasDetails: ['baby']
    });
    const extra = snap.selectedExtras.find(e => e.key === 'baby');
    assert.ok(extra, 'baby extra should be present');
    assert.equal(extra.unitPrice, 5);
    assert.equal(extra.quantity, 3);
    assert.equal(extra.lineTotal, 15);
    assert.equal(extra.billingMode, 'perDay');
  });

  it('warns about unknown extra keys', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 2 },
      selectedExtrasDetails: ['unknown-extra']
    });
    assert.ok(snap.warnings.some(w => w.includes('extra:missing:unknown-extra')));
  });
});

describe('buildPricingSnapshot — breakdown', () => {
  it('computes gross from charges when provided', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 3 },
      charges: {
        rental: 90,
        insurance: 36,
        options: 15,
        ageFee: 16,
        nightFee: 0,
        transport: 50,
        gross: 207
      }
    });
    assert.equal(snap.breakdown.rental, 90);
    assert.equal(snap.breakdown.insurance, 36);
    assert.equal(snap.breakdown.options, 15);
    assert.equal(snap.breakdown.ageFee, 16);
    assert.equal(snap.breakdown.transport, 50);
    assert.equal(snap.breakdown.gross, 207);
  });

  it('derives vat and net from gross', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 1, totalPrice: 124 }
    });
    const expectedNet = Math.round(124 / 1.24 * 100) / 100;
    const expectedVat = Math.round((124 - expectedNet) * 100) / 100;
    assert.equal(snap.breakdown.gross, 124);
    assert.equal(snap.breakdown.net, expectedNet);
    assert.equal(snap.breakdown.vat, expectedVat);
  });
});

describe('buildPricingSnapshot — appliedRates + catalogRef', () => {
  it('includes appliedRates with graceMinutes', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 2 },
      graceMinutes: 30
    });
    assert.equal(snap.appliedRates.graceMinutes, 30);
    assert.equal(snap.appliedRates.billableDays, 2);
  });

  it('includes catalogRef with businessSettingsId', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 1 }
    });
    assert.equal(snap.catalogRef.businessSettingsId, 'bs-1');
  });

  it('includes refs.insurancePlanId for known package', () => {
    const snap = buildPricingSnapshot({
      catalog: baseCatalog(),
      booking: { billableDays: 1 },
      selectedPackage: 'scdw'
    });
    assert.equal(snap.refs.insurancePlanId, 'ins-scdw');
  });
});

describe('buildPricingSnapshot — source field', () => {
  it('defaults source to booking-flow', () => {
    const snap = buildPricingSnapshot({ catalog: baseCatalog(), booking: {} });
    assert.equal(snap.source, 'booking-flow');
  });

  it('respects custom source', () => {
    const snap = buildPricingSnapshot({ catalog: baseCatalog(), booking: {}, source: 'createBooking' });
    assert.equal(snap.source, 'createBooking');
  });
});
