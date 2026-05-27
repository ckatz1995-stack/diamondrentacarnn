import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email('Μη έγκυρο email'),
  password: z.string().min(8, 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
  firstName: z.string().min(1, 'Απαιτείται όνομα'),
  lastName: z.string().min(1, 'Απαιτείται επώνυμο'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Μη έγκυρο email'),
  password: z.string().min(1, 'Απαιτείται κωδικός'),
});

const forgotSchema = z.object({
  email: z.string().email('Μη έγκυρο email'),
});

const resetSchema = z.object({
  token: z.string().min(1, 'Απαιτείται token'),
  password: z.string().min(8, 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
});

const resendSchema = z.object({
  email: z.string().email('Μη έγκυρο email'),
});

// POST /api/auth/register
router.post('/register', registerLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ ok: false, error: 'email_taken', message: 'Αυτό το email χρησιμοποιείται ήδη' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 3600000);
    const referralCode = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();

    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      emailVerifyToken,
      emailVerifyExpiry,
      referralCode,
    });

    const accessToken = signAccessToken({ userId: user._id });
    const refreshToken = signRefreshToken({ userId: user._id });

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { token: refreshToken, device: req.headers['user-agent'] || 'unknown' } },
    });

    const verifyLink = `${env.CLIENT_URL}/verify-email/${emailVerifyToken}`;
    sendWelcomeEmail(user, verifyLink).catch(err => logger.error('Welcome email failed', { error: err.message }));

    logger.info('User registered', { userId: user._id, email });

    res.status(201).json({
      ok: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        loyaltyTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'invalid_credentials', message: 'Λανθασμένο email ή κωδικός' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'invalid_credentials', message: 'Λανθασμένο email ή κωδικός' });
    }

    const accessToken = signAccessToken({ userId: user._id });
    const refreshToken = signRefreshToken({ userId: user._id });

    // Keep only last 5 refresh tokens per user, add new one
    const tokens = user.refreshTokens.slice(-4);
    tokens.push({ token: refreshToken, device: req.headers['user-agent'] || 'unknown' });

    await User.findByIdAndUpdate(user._id, { refreshTokens: tokens });

    logger.info('User logged in', { userId: user._id });

    res.json({
      ok: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        loyaltyTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        isAdmin: user.isAdmin,
        language: user.language,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await User.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }
    res.json({ ok: true, message: 'Αποσυνδεθήκατε επιτυχώς' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ ok: false, error: 'missing_token', message: 'Απαιτείται refresh token' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ ok: false, error: 'invalid_token', message: 'Μη έγκυρο refresh token' });
    }

    const user = await User.findOne({ _id: payload.userId, 'refreshTokens.token': refreshToken });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'token_reuse', message: 'Μη έγκυρο refresh token' });
    }

    // Rotate: remove old, issue new
    const newRefreshToken = signRefreshToken({ userId: user._id });
    const newAccessToken = signAccessToken({ userId: user._id });

    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { token: newRefreshToken, device: req.headers['user-agent'] || 'unknown' } },
    });

    res.json({ ok: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond OK to prevent email enumeration
    if (!user) {
      return res.json({ ok: true, message: 'Αν υπάρχει λογαριασμός με αυτό το email, θα λάβετε οδηγίες επαναφοράς.' });
    }

    const rawToken = uuidv4();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: expiry,
    });

    const resetLink = `${env.CLIENT_URL}/reset-password/${rawToken}`;
    sendPasswordResetEmail(user, resetLink).catch(err => logger.error('Reset email failed', { error: err.message }));

    logger.info('Password reset requested', { userId: user._id });

    res.json({ ok: true, message: 'Αν υπάρχει λογαριασμός με αυτό το email, θα λάβετε οδηγίες επαναφοράς.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find users with non-expired reset tokens
    const users = await User.find({
      resetPasswordToken: { $exists: true },
      resetPasswordExpiry: { $gt: new Date() },
    });

    let matchedUser = null;
    for (const u of users) {
      const match = await bcrypt.compare(token, u.resetPasswordToken);
      if (match) { matchedUser = u; break; }
    }

    if (!matchedUser) {
      return res.status(400).json({ ok: false, error: 'invalid_token', message: 'Μη έγκυρος ή ληγμένος σύνδεσμος επαναφοράς' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(matchedUser._id, {
      passwordHash,
      resetPasswordToken: undefined,
      resetPasswordExpiry: undefined,
      refreshTokens: [], // Invalidate all sessions
    });

    logger.info('Password reset completed', { userId: matchedUser._id });

    res.json({ ok: true, message: 'Ο κωδικός άλλαξε επιτυχώς. Παρακαλούμε συνδεθείτε ξανά.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ ok: false, error: 'invalid_token', message: 'Μη έγκυρος ή ληγμένος σύνδεσμος επαλήθευσης' });
    }

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerifyToken: undefined,
      emailVerifyExpiry: undefined,
    });

    logger.info('Email verified', { userId: user._id });

    res.json({ ok: true, message: 'Το email επαληθεύτηκε επιτυχώς!' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', validate(resendSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ ok: true, message: 'Αν υπάρχει λογαριασμός, θα λάβετε email επαλήθευσης.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ ok: false, error: 'already_verified', message: 'Το email έχει ήδη επαληθευτεί.' });
    }

    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 3600000);

    await User.findByIdAndUpdate(user._id, { emailVerifyToken, emailVerifyExpiry });

    const verifyLink = `${env.CLIENT_URL}/verify-email/${emailVerifyToken}`;
    sendVerificationEmail(user, verifyLink).catch(err => logger.error('Verification email failed', { error: err.message }));

    res.json({ ok: true, message: 'Το email επαλήθευσης στάλθηκε ξανά.' });
  } catch (err) {
    next(err);
  }
});

export default router;
