import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path });
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.code || 'server_error',
    message: err.message || 'Σφάλμα διακομιστή. Δοκιμάστε ξανά.',
    details: err.details || {},
  });
}
