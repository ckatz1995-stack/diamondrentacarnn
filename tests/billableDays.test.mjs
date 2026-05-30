import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeBillableDays, computeBillableDaysDetailed } from '../src/backend/billableDays.js';

const ATHENS_TZ = 'Europe/Athens';

function dateUTC(isoString) {
  return new Date(isoString);
}

describe('computeBillableDays', () => {
  it('returns fallback for null/invalid inputs', () => {
    assert.equal(computeBillableDays(null, null, 3), 3);
    assert.equal(computeBillableDays('bad', 'input', 2), 2);
    assert.equal(computeBillableDays(null, null), 1);
  });

  it('returns fallback when end <= start', () => {
    const start = dateUTC('2024-06-01T08:00:00Z');
    const end = dateUTC('2024-06-01T07:00:00Z');
    assert.equal(computeBillableDays(start, end, 2), 2);
  });

  it('exact 24h = 1 day', () => {
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-02T10:00:00Z'),
      1
    );
  });

  it('25h = 2 days (no timezone)', () => {
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-02T11:00:00Z'),
      2
    );
  });

  it('47h = 2 days', () => {
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-03T09:00:00Z'),
      2
    );
  });

  it('48h = 2 days', () => {
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-03T10:00:00Z'),
      2
    );
  });

  it('minimum 1 day even for very short rentals', () => {
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-01T11:00:00Z'),
      1
    );
  });
});

describe('computeBillableDays — grace minutes', () => {
  it('30 min grace absorbs 30 min overage', () => {
    // 24.5h rental with 30 min grace → effective 24h → 1 day
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-02T10:30:00Z', 1, 30),
      1
    );
  });

  it('grace does not absorb more than provided', () => {
    // 25h rental with 30 min grace → effective 24.5h → 2 days
    assert.equal(
      computeBillableDays('2024-06-01T10:00:00Z', '2024-06-02T11:00:00Z', 1, 30),
      2
    );
  });
});

describe('computeBillableDays — DST correction (Europe/Athens)', () => {
  // Greece spring forward: last Sunday of March 2024 = March 31
  // Clocks go 03:00 → 04:00 (UTC+2 → UTC+3), so UTC diff for same-time-next-day = 23h
  it('spring forward: same-time next day = 1 day', () => {
    // Pickup: Mar 30, 10:00 Athens (UTC+2) = 08:00 UTC
    // Dropoff: Mar 31, 10:00 Athens (UTC+3) = 07:00 UTC → 23h UTC diff
    assert.equal(
      computeBillableDays('2024-03-30T08:00:00Z', '2024-03-31T07:00:00Z', 1, 0, ATHENS_TZ),
      1
    );
  });

  // Greece fall back: last Sunday of October 2024 = October 27
  // Clocks go 04:00 → 03:00 (UTC+3 → UTC+2), so UTC diff for same-time-next-day = 25h
  it('fall back: same-time next day = 1 day (not 2)', () => {
    // Pickup: Oct 26, 10:00 Athens (UTC+3) = 07:00 UTC
    // Dropoff: Oct 27, 10:00 Athens (UTC+2) = 08:00 UTC → 25h UTC diff
    assert.equal(
      computeBillableDays('2024-10-26T07:00:00Z', '2024-10-27T08:00:00Z', 1, 0, ATHENS_TZ),
      1
    );
  });

  it('fall back: 2 actual days stays 2 days', () => {
    // Oct 25 10:00 → Oct 27 10:00 Athens (crosses fall-back night) = 49h UTC
    assert.equal(
      computeBillableDays('2024-10-25T07:00:00Z', '2024-10-27T08:00:00Z', 1, 0, ATHENS_TZ),
      2
    );
  });

  it('no timezone = old behavior (UTC hours)', () => {
    // 25h UTC, no timezone → ceil(25/24) = 2
    assert.equal(
      computeBillableDays('2024-10-26T07:00:00Z', '2024-10-27T08:00:00Z', 1, 0, null),
      2
    );
  });
});

describe('computeBillableDaysDetailed', () => {
  it('returns hours and billableDays', () => {
    const result = computeBillableDaysDetailed(
      '2024-06-01T10:00:00Z',
      '2024-06-03T10:00:00Z',
      1, 0, ATHENS_TZ
    );
    assert.equal(result.billableDays, 2);
    assert.ok(typeof result.hours === 'number');
  });

  it('invalid dates return fallback', () => {
    const result = computeBillableDaysDetailed(null, null, 5);
    assert.equal(result.billableDays, 5);
    assert.equal(result.hours, 0);
  });
});
