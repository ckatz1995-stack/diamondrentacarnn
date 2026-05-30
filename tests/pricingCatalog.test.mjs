import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDynamicPricingRate, computeAutomaticFees } from '../src/backend/pricingCatalog.jsw';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeSeasons(list) {
  return list.map((s, i) => ({
    key: s.key,
    label: s.label || s.key,
    startDate: s.startDate,
    endDate: s.endDate,
    active: true,
    repeatYearly: s.repeatYearly || false,
    priority: s.priority || 0,
    sortOrder: (i + 1) * 10
  }));
}

function makeRules(list) {
  return list.map((r, i) => ({
    key: r.key,
    label: r.label || r.key,
    categoryCode: r.categoryCode || '',
    vehicleCategoryId: r.vehicleCategoryId || '',
    seasonKey: r.seasonKey || '',
    minDays: r.minDays ?? 1,
    maxDays: r.maxDays ?? 0,
    pricePerDay: r.pricePerDay,
    active: true,
    sortOrder: (i + 1) * 10
  }));
}

function makeCatalog({ seasons = [], rules = [] } = {}) {
  return { pricingSeasons: makeSeasons(seasons), categoryRateRules: makeRules(rules) };
}

function pickup(iso) { return new Date(iso); }
function dropoff(iso) { return new Date(iso); }

// ---------------------------------------------------------------------------
// resolveDynamicPricingRate
// ---------------------------------------------------------------------------
describe('resolveDynamicPricingRate — single season', () => {
  const catalog = makeCatalog({
    seasons: [{ key: 'summer', startDate: '2024-06-01', endDate: '2024-09-30' }],
    rules: [
      { key: 'A_summer', categoryCode: 'A', seasonKey: 'summer', pricePerDay: 50 },
      { key: 'A_default', categoryCode: 'A', pricePerDay: 30 }
    ]
  });

  it('selects summer season rate when pickup is in summer', () => {
    const result = resolveDynamicPricingRate({
      categoryCode: 'A',
      billableDays: 3,
      pickupDateTime: pickup('2024-07-15T10:00:00Z'),
      dropoffDateTime: dropoff('2024-07-18T10:00:00Z'),
      catalog,
      fallbackPricePerDay: 20
    });
    assert.equal(result.pricePerDay, 50);
    assert.equal(result.season?.key, 'summer');
    assert.equal(result.crossSeason, false);
  });

  it('falls back to default rule when pickup is outside all seasons', () => {
    const result = resolveDynamicPricingRate({
      categoryCode: 'A',
      billableDays: 3,
      pickupDateTime: pickup('2024-03-15T10:00:00Z'),
      dropoffDateTime: dropoff('2024-03-18T10:00:00Z'),
      catalog,
      fallbackPricePerDay: 20
    });
    assert.equal(result.pricePerDay, 30);
    assert.equal(result.season, null);
    assert.equal(result.crossSeason, false);
  });

  it('returns fallbackPricePerDay when no rule matches', () => {
    const result = resolveDynamicPricingRate({
      categoryCode: 'B',
      billableDays: 2,
      pickupDateTime: pickup('2024-07-15T10:00:00Z'),
      dropoffDateTime: dropoff('2024-07-17T10:00:00Z'),
      catalog,
      fallbackPricePerDay: 25
    });
    assert.equal(result.pricePerDay, 25);
    assert.equal(result.source, 'vehicleBasePrice');
  });
});

describe('resolveDynamicPricingRate — day-bracket (minDays/maxDays)', () => {
  const catalog = makeCatalog({
    rules: [
      { key: 'A_short', categoryCode: 'A', minDays: 1, maxDays: 3, pricePerDay: 40 },
      { key: 'A_long',  categoryCode: 'A', minDays: 4, maxDays: 0, pricePerDay: 30 }
    ]
  });

  it('selects short-stay rate for 2 days', () => {
    const result = resolveDynamicPricingRate({ categoryCode: 'A', billableDays: 2, catalog, fallbackPricePerDay: 0 });
    assert.equal(result.pricePerDay, 40);
  });

  it('selects long-stay rate for 7 days', () => {
    const result = resolveDynamicPricingRate({ categoryCode: 'A', billableDays: 7, catalog, fallbackPricePerDay: 0 });
    assert.equal(result.pricePerDay, 30);
  });
});

describe('resolveDynamicPricingRate — seasonal crossover', () => {
  const catalog = makeCatalog({
    seasons: [
      { key: 'high',  startDate: '2024-06-15', endDate: '2024-09-15' },
      { key: 'low',   startDate: '2024-01-01', endDate: '2024-06-14' }
    ],
    rules: [
      { key: 'A_high', categoryCode: 'A', seasonKey: 'high', pricePerDay: 60 },
      { key: 'A_low',  categoryCode: 'A', seasonKey: 'low',  pricePerDay: 30 }
    ]
  });

  it('pure high-season rental — no crossover', () => {
    const result = resolveDynamicPricingRate({
      categoryCode: 'A',
      billableDays: 4,
      pickupDateTime: pickup('2024-07-01T00:00:00Z'),
      dropoffDateTime: dropoff('2024-07-05T00:00:00Z'),
      catalog,
      fallbackPricePerDay: 0
    });
    assert.equal(result.pricePerDay, 60);
    assert.equal(result.crossSeason, false);
  });

  it('pure low-season rental — no crossover', () => {
    const result = resolveDynamicPricingRate({
      categoryCode: 'A',
      billableDays: 4,
      pickupDateTime: pickup('2024-06-10T00:00:00Z'),
      dropoffDateTime: dropoff('2024-06-14T00:00:00Z'),
      catalog,
      fallbackPricePerDay: 0
    });
    assert.equal(result.pricePerDay, 30);
    assert.equal(result.crossSeason, false);
  });

  it('crossover: 3 low + 3 high days → weighted average', () => {
    // Pickup Jun 12 (low, €30), Dropoff Jun 18 (high, €60), 6 days
    // Days Jun 12,13,14 = low (€30×3=90), Jun 15,16,17 = high (€60×3=180)
    // total=270, average=45
    const result = resolveDynamicPricingRate({
      categoryCode: 'A',
      billableDays: 6,
      pickupDateTime: pickup('2024-06-12T00:00:00Z'),
      dropoffDateTime: dropoff('2024-06-18T00:00:00Z'),
      catalog,
      fallbackPricePerDay: 0
    });
    assert.equal(result.crossSeason, true);
    assert.equal(result.pricePerDay, 45);
    assert.equal(result.source, 'dynamicRule');
  });

  it('crossover: 1 low + 5 high days → skewed toward high', () => {
    // Jun 14 (low, 30) + Jun 15-19 (high, 60×5=300) = 330 / 6 = 55
    const result = resolveDynamicPricingRate({
      categoryCode: 'A',
      billableDays: 6,
      pickupDateTime: pickup('2024-06-14T00:00:00Z'),
      dropoffDateTime: dropoff('2024-06-20T00:00:00Z'),
      catalog,
      fallbackPricePerDay: 0
    });
    assert.equal(result.crossSeason, true);
    assert.equal(result.pricePerDay, 55);
  });
});

// ---------------------------------------------------------------------------
// computeAutomaticFees
// ---------------------------------------------------------------------------
describe('computeAutomaticFees', () => {
  const businessSettings = { nightStartHour: 22, nightEndHour: 8 };
  const feeRules = [
    { key: 'youngDriver', ruleType: 'ageRange', audienceGroup: '19-22', amount: 16, active: true, billingMode: 'perBooking' },
    { key: 'seniorDriver', ruleType: 'ageRange', audienceGroup: '70+', amount: 10, active: true, billingMode: 'perBooking' },
    { key: 'nightPickup', ruleType: 'nightPickup', amount: 15, active: true, billingMode: 'perBooking' },
    { key: 'nightDropoff', ruleType: 'nightDropoff', amount: 15, active: true, billingMode: 'perBooking' }
  ];

  it('no fees for adult driver with daytime pickup/dropoff', () => {
    const result = computeAutomaticFees({
      driverAge: '23-69',
      pickupDateTime: new Date('2024-06-15T10:00:00Z'), // 13:00 Athens
      dropoffDateTime: new Date('2024-06-18T10:00:00Z'),
      businessSettings,
      feeRules
    });
    assert.equal(result.ageFee, 0);
    assert.equal(result.nightFee, 0);
  });

  it('age fee for 19-22 driver', () => {
    const result = computeAutomaticFees({
      driverAge: '19-22',
      pickupDateTime: new Date('2024-06-15T10:00:00Z'),
      dropoffDateTime: new Date('2024-06-18T10:00:00Z'),
      businessSettings,
      feeRules
    });
    assert.equal(result.ageFee, 16);
  });

  it('age fee for 70+ driver', () => {
    const result = computeAutomaticFees({
      driverAge: '70+',
      pickupDateTime: new Date('2024-06-15T10:00:00Z'),
      dropoffDateTime: new Date('2024-06-18T10:00:00Z'),
      businessSettings,
      feeRules
    });
    assert.equal(result.ageFee, 10);
  });

  it('night pickup fee when pickup is at 23:00 Athens', () => {
    // 23:00 Athens (UTC+3 in summer) = 20:00 UTC
    const result = computeAutomaticFees({
      driverAge: '23-69',
      pickupDateTime: new Date('2024-06-15T20:00:00Z'),
      dropoffDateTime: new Date('2024-06-18T10:00:00Z'),
      businessSettings,
      feeRules
    });
    assert.equal(result.nightFee, 15);
  });

  it('night fee for both pickup and dropoff outside hours', () => {
    // Both at 23:00 Athens
    const result = computeAutomaticFees({
      driverAge: '23-69',
      pickupDateTime: new Date('2024-06-15T20:00:00Z'),
      dropoffDateTime: new Date('2024-06-18T20:00:00Z'),
      businessSettings,
      feeRules
    });
    assert.equal(result.nightFee, 30);
  });

  it('combined: age + night fees', () => {
    const result = computeAutomaticFees({
      driverAge: '19-22',
      pickupDateTime: new Date('2024-06-15T20:00:00Z'),
      dropoffDateTime: new Date('2024-06-18T10:00:00Z'),
      businessSettings,
      feeRules
    });
    assert.equal(result.ageFee, 16);
    assert.equal(result.nightFee, 15);
  });

  it('fallback fees when no feeRules provided', () => {
    const result = computeAutomaticFees({
      driverAge: '19-22',
      pickupDateTime: new Date('2024-06-15T20:00:00Z'),
      dropoffDateTime: new Date('2024-06-18T10:00:00Z'),
      businessSettings,
      feeRules: []
    });
    assert.equal(result.ageFee, 16); // hardcoded fallback
    assert.equal(result.nightFee, 15); // hardcoded fallback
  });
});
