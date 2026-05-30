function asDate(value) {
  if (!value && value !== 0) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function _readPart(parts, type) {
  const hit = (parts || []).find(p => p.type === type);
  return hit ? Number(hit.value) : 0;
}

// Returns the offset (ms) between the timezone's wall-clock representation of
// `date` and its UTC epoch value. Used to correct UTC diff for DST transitions.
function _localOffsetMs(date, timezone) {
  try {
    const dtf = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23'
    });
    const parts = dtf.formatToParts(date);
    const asUtc = Date.UTC(
      _readPart(parts, 'year'),
      _readPart(parts, 'month') - 1,
      _readPart(parts, 'day'),
      _readPart(parts, 'hour'),
      _readPart(parts, 'minute'),
      _readPart(parts, 'second')
    );
    return asUtc - date.getTime();
  } catch (_) {
    return 0;
  }
}

export function computeBillableDaysDetailed(pickup, dropoff, fallbackDays = 1, graceMinutes = 0, timezone = null) {
  const start = asDate(pickup);
  const end = asDate(dropoff);
  if (!start || !end || end <= start) {
    const normalizedFallback = Math.max(1, Number.isFinite(Number(fallbackDays)) ? Number(fallbackDays) : 1);
    return { hours: 0, billableDays: normalizedFallback };
  }

  const utcDiffMs = end.getTime() - start.getTime();
  // Correct for DST: if clocks fall back between pickup and dropoff the UTC diff
  // is 25h for a customer-perceived 24h rental; the offset delta brings it back.
  const dstCorrectionMs = timezone
    ? _localOffsetMs(end, timezone) - _localOffsetMs(start, timezone)
    : 0;
  const hours = (utcDiffMs + dstCorrectionMs) / (1000 * 60 * 60);
  const graceHours = Math.max(0, Number.isFinite(Number(graceMinutes)) ? Number(graceMinutes) / 60 : 0);
  const effectiveHours = Math.max(0, hours - graceHours);
  return {
    hours,
    billableDays: Math.max(1, Math.ceil(effectiveHours / 24))
  };
}

export function computeBillableDays(pickup, dropoff, fallbackDays = 1, graceMinutes = 0, timezone = null) {
  return computeBillableDaysDetailed(pickup, dropoff, fallbackDays, graceMinutes, timezone).billableDays;
}
