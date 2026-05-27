import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

function createUploader(subdir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(env.UPLOAD_DIR, subdir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${req.user._id}-${Date.now()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Μη επιτρεπτός τύπος αρχείου. Επιτρέπονται μόνο JPEG, PNG, WebP.'));
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: env.MAX_FILE_SIZE } });
}

const avatarUpload = createUploader('avatars');
const licenseUpload = createUploader('licenses');

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  driverAge: z.enum(['19-22', '23-69', '70+']).optional(),
  preferredPickupLocation: z.string().optional(),
  language: z.enum(['el', 'en']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Απαιτείται τρέχων κωδικός'),
  newPassword: z.string().min(8, 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
});

const prefsSchema = z.object({
  notificationPrefs: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    inApp: z.boolean().optional(),
  }).optional(),
  language: z.enum(['el', 'en']).optional(),
});

const secondaryDriverSchema = z.object({
  name: z.string().min(1, 'Απαιτείται όνομα οδηγού'),
  license: z.string().min(1, 'Απαιτείται αριθμός διπλώματος'),
});

// GET /api/profile
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash -refreshTokens -emailVerifyToken -emailVerifyExpiry -resetPasswordToken -resetPasswordExpiry')
      .lean();

    res.json({ ok: true, profile: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile
router.patch('/', validate(updateProfileSchema), async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'nationality',
      'licenseNumber', 'licenseExpiry', 'driverAge',
      'preferredPickupLocation', 'language',
    ];

    const updates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ ok: false, error: 'no_changes', message: 'Δεν υπάρχουν αλλαγές' });
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-passwordHash -refreshTokens -emailVerifyToken -emailVerifyExpiry -resetPasswordToken -resetPasswordExpiry');

    res.json({ ok: true, profile: updated, message: 'Το προφίλ ενημερώθηκε επιτυχώς' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile/password
router.patch('/password', validate(changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'wrong_password', message: 'Λανθασμένος τρέχων κωδικός' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.user._id, { passwordHash });

    logger.info('Password changed', { userId: req.user._id });
    res.json({ ok: true, message: 'Ο κωδικός άλλαξε επιτυχώς' });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/avatar
router.post('/avatar', (req, res, next) => {
  avatarUpload.single('avatar')(req, res, async (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Το αρχείο υπερβαίνει το μέγιστο επιτρεπτό μέγεθος'
        : err.message;
      return res.status(status).json({ ok: false, error: 'upload_error', message });
    }

    if (!req.file) {
      return res.status(422).json({ ok: false, error: 'no_file', message: 'Δεν επιλέχθηκε αρχείο' });
    }

    try {
      // Delete old avatar if exists
      const user = await User.findById(req.user._id);
      if (user.avatarUrl) {
        const oldPath = path.resolve(env.UPLOAD_DIR, user.avatarUrl.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user._id, { avatarUrl });

      res.json({ ok: true, avatarUrl, message: 'Η φωτογραφία ανέβηκε επιτυχώς' });
    } catch (err2) {
      next(err2);
    }
  });
});

// DELETE /api/profile/avatar
router.delete('/avatar', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.avatarUrl) {
      return res.status(404).json({ ok: false, error: 'no_avatar', message: 'Δεν υπάρχει φωτογραφία προφίλ' });
    }

    const filePath = path.resolve(env.UPLOAD_DIR, user.avatarUrl.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await User.findByIdAndUpdate(req.user._id, { $unset: { avatarUrl: '' } });
    res.json({ ok: true, message: 'Η φωτογραφία προφίλ διαγράφηκε' });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/license-photo
router.post('/license-photo', (req, res, next) => {
  licenseUpload.single('license')(req, res, async (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Το αρχείο υπερβαίνει το μέγιστο επιτρεπτό μέγεθος'
        : err.message;
      return res.status(status).json({ ok: false, error: 'upload_error', message });
    }

    if (!req.file) {
      return res.status(422).json({ ok: false, error: 'no_file', message: 'Δεν επιλέχθηκε αρχείο' });
    }

    try {
      const user = await User.findById(req.user._id);
      if (user.licensePhotoUrl) {
        const oldPath = path.resolve(env.UPLOAD_DIR, user.licensePhotoUrl.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const licensePhotoUrl = `/uploads/licenses/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user._id, { licensePhotoUrl });

      res.json({ ok: true, licensePhotoUrl, message: 'Η φωτογραφία διπλώματος ανέβηκε επιτυχώς' });
    } catch (err2) {
      next(err2);
    }
  });
});

// POST /api/profile/secondary-driver
router.post('/secondary-driver', validate(secondaryDriverSchema), async (req, res, next) => {
  try {
    const { name, license } = req.body;
    const user = await User.findById(req.user._id);

    if (user.secondaryDrivers.length >= 3) {
      return res.status(400).json({ ok: false, error: 'limit_reached', message: 'Μέγιστος αριθμός δευτερευόντων οδηγών: 3' });
    }

    user.secondaryDrivers.push({ name, license });
    await user.save();

    res.status(201).json({ ok: true, secondaryDrivers: user.secondaryDrivers, message: 'Ο δευτερεύων οδηγός προστέθηκε' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/profile/secondary-driver/:idx
router.delete('/secondary-driver/:idx', async (req, res, next) => {
  try {
    const idx = Number(req.params.idx);
    const user = await User.findById(req.user._id);

    if (isNaN(idx) || idx < 0 || idx >= user.secondaryDrivers.length) {
      return res.status(404).json({ ok: false, error: 'not_found', message: 'Ο δευτερεύων οδηγός δεν βρέθηκε' });
    }

    user.secondaryDrivers.splice(idx, 1);
    await user.save();

    res.json({ ok: true, secondaryDrivers: user.secondaryDrivers, message: 'Ο δευτερεύων οδηγός αφαιρέθηκε' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile/preferences
router.patch('/preferences', validate(prefsSchema), async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.language) updates.language = req.body.language;
    if (req.body.notificationPrefs) {
      const prefs = req.body.notificationPrefs;
      if (prefs.email !== undefined) updates['notificationPrefs.email'] = prefs.email;
      if (prefs.sms !== undefined) updates['notificationPrefs.sms'] = prefs.sms;
      if (prefs.inApp !== undefined) updates['notificationPrefs.inApp'] = prefs.inApp;
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('language notificationPrefs');

    res.json({ ok: true, preferences: { language: updated.language, notificationPrefs: updated.notificationPrefs }, message: 'Οι προτιμήσεις ενημερώθηκαν' });
  } catch (err) {
    next(err);
  }
});

export default router;
