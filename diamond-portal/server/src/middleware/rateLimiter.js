import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { ok: false, error: 'rate_limit', message: 'Πάρα πολλές προσπάθειες. Δοκιμάστε σε 15 λεπτά.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { ok: false, error: 'rate_limit', message: 'Πάρα πολλές εγγραφές. Δοκιμάστε αργότερα.' },
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { ok: false, error: 'rate_limit', message: 'Πάρα πολλά αιτήματα.' },
});
