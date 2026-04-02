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
import profileRoutes from './modules/profile/profile.routes';
import companyRoutes from './modules/company/company.routes';
import adminRoutes from './modules/admin/admin.routes';
import cvRoutes from './modules/cv/cv.routes';
import offerRoutes from './modules/offer/offer.routes';
import chatRoutes from './modules/chat/chat.routes';

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

// Modules
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/health', async (_req: Request, res: Response) => {
  try {
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

    let aiStatus = 'unknown';
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8002';
    try {
      const aiResponse = await fetch(`${aiServiceUrl}/health`, { 
        signal: AbortSignal.timeout(2000) 
      });
      aiStatus = aiResponse.ok ? 'ok' : 'error';
    } catch {
      aiStatus = 'unavailable';
    }

    const statusCode = dbStatus === 'ok' && redisStatus === 'ok' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: {
        api: 'ok',
        db: dbStatus,
        redis: redisStatus,
        ai: aiStatus,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────
// Debug route temporaire
// ────────────────────────────────────────────────────────────────
app.get('/debug/vectors', async (_req: Request, res: Response) => {
  try {
    const cvDocs: any = await prisma.$queryRaw`
      SELECT id, 
             CASE WHEN embedding IS NOT NULL THEN vector_dims(embedding) ELSE NULL END as dims,
             parseStatus
      FROM cv_documents
    `;
    const offers: any = await prisma.$queryRaw`
      SELECT id, 
             CASE WHEN embedding IS NOT NULL THEN vector_dims(embedding) ELSE NULL END as dims,
             offerStatus
      FROM job_offers
    `;
    const matchesCount = await prisma.matchScore.count();

    res.json({
      success: true,
      data: {
        cv_documents: cvDocs.map((doc: any) => ({ id: doc.id, dimensions: doc.dims, parseStatus: doc.parsestatus || doc.parseStatus })),
        job_offers: offers.map((offer: any) => ({ id: offer.id, dimensions: offer.dims, offerStatus: offer.offerstatus || offer.offerStatus })),
        match_scores_count: matchesCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
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

