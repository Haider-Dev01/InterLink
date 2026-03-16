import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { prisma } from '../config/prismaClient';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const ip = req.ip;
    const email = req.body.email || 'unknown';

    logger.warn(`[RateLimit] Blocage auth pour IP: ${ip}, Email: ${email}`);

    // Audit log as requested (D08)
    prisma.auditLog.create({
      data: {
        action: 'AUTH_RATE_LIMIT_BLOCKED',
        entityType: 'USER',
        metadata: { 
          ip: ip ?? 'unknown', 
          email: String(email), 
          attempts: options.limit // express-rate-limit v7+ uses 'limit' instead of 'max' in options
        } as any
      }
    }).catch(err => logger.error(`[RateLimit] Erreur auto-log: ${err.message}`));

    res.status(429).json({
      success: false,
      message: 'Trop de tentatives - Compte bloqué temporairement (15 min)',
    });
  },
  // On limite par email s'il existe, sinon par IP
  keyGenerator: (req) => String(req.body.email || req.ip || 'global'),
});
