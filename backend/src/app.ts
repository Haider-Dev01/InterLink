import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './shared/config/env';
import { prisma } from './shared/config/prismaClient';
import { redis } from './shared/config/redisClient';
import { errorHandler } from './shared/middleware/errorHandler';

// Import des routes
import authRoutes from './modules/auth/auth.routes';

export const app = express();

// ────────────────────────────────────────────────────────────────
// Middleware globaux
// ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: env.FRONTEND_URL, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ────────────────────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────────────────────

// Module Auth
app.use('/api/auth', authRoutes);

// GET /health
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  try {
    const pong = await redis.ping();
    if (pong !== 'PONG') redisStatus = 'error';
  } catch {
    redisStatus = 'error';
  }

  const statusCode = dbStatus === 'ok' && redisStatus === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    success: true,
    data: {
      api: 'ok',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    }
  });
});

// ────────────────────────────────────────────────────────────────
// 404 handler
// ────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// ────────────────────────────────────────────────────────────────
// Global error handler
// ────────────────────────────────────────────────────────────────
app.use(errorHandler);

