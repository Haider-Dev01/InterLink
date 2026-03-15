import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { prisma } from './shared/config/prismaClient';
import { redis } from './shared/config/redisClient';

export const app = express();

// ────────────────────────────────────────────────────────────────
// Middleware globaux
// ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ────────────────────────────────────────────────────────────────
// GET /health
// ────────────────────────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  // Vérifier Prisma / PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  // Vérifier Redis
  try {
    const pong = await redis.ping();
    if (pong !== 'PONG') redisStatus = 'error';
  } catch {
    redisStatus = 'error';
  }

  const statusCode = dbStatus === 'ok' && redisStatus === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    api: 'ok',
    db: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// ────────────────────────────────────────────────────────────────
// 404 handler
// ────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ────────────────────────────────────────────────────────────────
// Global error handler
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});
