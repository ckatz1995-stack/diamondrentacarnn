import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import profileRoutes from './routes/profile.js';
import documentRoutes from './routes/documents.js';
import reviewRoutes from './routes/reviews.js';
import loyaltyRoutes from './routes/loyalty.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import supportRoutes from './routes/support.js';
import adminRoutes from './routes/admin.js';
import { requireAuth } from './middleware/auth.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure upload dir exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/bookings', requireAuth, generalLimiter, bookingRoutes);
app.use('/api/profile', requireAuth, generalLimiter, profileRoutes);
app.use('/api/documents', generalLimiter, documentRoutes);
app.use('/api/reviews', requireAuth, generalLimiter, reviewRoutes);
app.use('/api/loyalty', requireAuth, generalLimiter, loyaltyRoutes);
app.use('/api/notifications', requireAuth, generalLimiter, notificationRoutes);
app.use('/api/analytics', requireAuth, generalLimiter, analyticsRoutes);
app.use('/api/support', requireAuth, generalLimiter, supportRoutes);
app.use('/api/admin', requireAuth, generalLimiter, adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date(), env: env.NODE_ENV }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'not_found', message: 'Η διαδρομή δεν βρέθηκε' });
});

// Error handler
app.use(errorHandler);

await connectDB();
app.listen(env.PORT, () => logger.info(`Diamond Portal API running on port ${env.PORT}`));
