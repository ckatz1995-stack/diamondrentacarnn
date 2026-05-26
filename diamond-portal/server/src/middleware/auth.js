import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'unauthorized', message: 'Απαιτείται σύνδεση' });
  }
  try {
    const payload = verifyAccessToken(auth.slice(7));
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json({ ok: false, error: 'unauthorized', message: 'Χρήστης δεν βρέθηκε' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'token_expired', message: 'Η σύνδεση έληξε' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ ok: false, error: 'forbidden', message: 'Δεν επιτρέπεται' });
  }
  next();
}
