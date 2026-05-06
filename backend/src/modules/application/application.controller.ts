import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';
import { prisma } from '../../shared/config/prismaClient';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

export const applicationController = {
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.user!.id;
      const { offerId, coverLetter } = req.body;
      const result = await applicationService.apply(candidateId, offerId, coverLetter);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.user!.id;
      const result = await applicationService.getMyApplications(candidateId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOfferApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = Array.isArray(req.params.offerId) ? req.params.offerId[0] : req.params.offerId;
      const recruiterId = req.user!.id;
      const result = await applicationService.getOfferApplications(offerId, recruiterId);
      
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getRecruiterApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const recruiterId = req.user!.id;
      const offerId = typeof req.query.offerId === 'string' ? req.query.offerId : undefined;
      const result = await applicationService.getRecruiterApplications(recruiterId, offerId);
      
      const formatted = result.map(app => ({
        ...app,
        cvUrl: app.cvUrl ? toPublicAssetUrl(req, app.cvUrl) : null
      }));

      return res.status(200).json({
        success: true,
        data: { applications: formatted },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await applicationService.updateStatus(id, status, userId, userRole);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async withdrawApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const candidateId = req.user!.id;
      const result = await applicationService.withdrawApplication(id, candidateId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  async getMatchScore(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      // 1. Récupérer l'application avec CV et offre
      const application = await prisma.application.findUnique({
        where: { id },
        select: {
          id: true,
          candidateId: true,
          offerId: true,
          offer: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              offerStatus: true
            }
          }
        }
      });
      if (!application) {
        return res.status(404).json({
          success: false, message: 'Candidature introuvable'
        });
      }

      // 2. Récupérer embedding CV actif du candidat
      const cvDoc = await prisma.cvDocument.findFirst({
        where: {
          userId: application.candidateId,
          isActive: true,
          parseStatus: 'done'
        }
      });
      if (!cvDoc) {
        return res.status(400).json({
          success: false,
          message: 'CV du candidat non parsé'
        });
      }

      // 3. Récupérer embeddings via raw SQL
      const cvEmbResult = await prisma.$queryRaw`
        SELECT embedding::text FROM cv_documents WHERE id = ${cvDoc.id}
      ` as any[];
      const offerEmbResult = await prisma.$queryRaw`
        SELECT embedding::text FROM job_offers WHERE id = ${application.offerId}
      ` as any[];

      if (!cvEmbResult[0]?.embedding || !offerEmbResult[0]?.embedding) {
        return res.status(400).json({
          success: false,
          message: 'Embeddings non disponibles'
        });
      }

      // Parser les vecteurs depuis format pgvector "[0.1,0.2,...]"
      const cvEmbedding = JSON.parse(cvEmbResult[0].embedding);
      const offerEmbedding = JSON.parse(offerEmbResult[0].embedding);

      // 4. Appeler Python /match/score
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8002';
      const response = await fetch(
        `${aiUrl}/match/score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cv_embedding: cvEmbedding,
            offer_embedding: offerEmbedding
          }),
          signal: AbortSignal.timeout(10000)
        }
      );
      const matchData = await response.json() as { score: number; score_percent: number };

      // 5. Sauvegarder le score dans match_scores via UPSERT
      await prisma.$executeRaw`
        INSERT INTO match_scores
          (id, "candidateId", "offerId", "cvDocumentId",
           "scoreCosinus", "scoreFinal", breakdown, "computedAt")
        VALUES
          (gen_random_uuid()::text,
           ${application.candidateId},
           ${application.offerId},
           ${cvDoc.id},
           ${matchData.score},
           ${matchData.score},
           ${JSON.stringify({ score_cosinus: matchData.score,
               score_final: matchData.score,
               computed_by: 'python_on_demand' })}::jsonb,
           NOW())
        ON CONFLICT ("candidateId", "offerId")
        DO UPDATE SET
          "scoreCosinus" = EXCLUDED."scoreCosinus",
          "scoreFinal" = EXCLUDED."scoreFinal",
          breakdown = EXCLUDED.breakdown,
          "computedAt" = NOW()
      `;

      return res.json({
        success: true,
        data: {
          score: matchData.score,
          scorePercent: matchData.score_percent,
          applicationId: id
        }
      });
    } catch (err) {
      next(err);
    }
  },
};
